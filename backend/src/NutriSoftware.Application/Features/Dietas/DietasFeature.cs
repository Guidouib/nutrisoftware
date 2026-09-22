using System.Text.Json;
using MediatR;
using NutriSoftware.Application.DTOs.Dietas;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Dietas;

internal static class DietaMapper
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    internal static DietaDto ToDto(Dieta d) => new(
        d.Id,
        d.PacienteId,
        d.Fecha,
        d.Nombre,
        new RequerimientosDto(
            d.CaloriasObjetivo ?? 0,
            d.ProteinasObjetivo ?? 0,
            d.CarbohidratosObjetivo ?? 0,
            d.GrasasObjetivo ?? 0),
        d.Dias
            .OrderBy(dia => dia.DiaSemana)
            .Select(dia => new DiaDietaDto(
                dia.DiaSemana,
                dia.TiemposComida
                    .OrderBy(t => t.Orden)
                    .Select(t => new TiempoComidaDto(
                        t.Id.ToString(),
                        t.Nombre,
                        Deserializar(t.AlimentosJson)))
                    .ToList()))
            .ToList(),
        d.ModoIntercambios
    );

    /// <summary>Un JSON corrupto no debe tumbar la dieta entera: ese tiempo queda vacío.</summary>
    private static List<AlimentoEnDietaDto> Deserializar(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<AlimentoEnDietaDto>>(json, Json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    internal static string Serializar(List<AlimentoEnDietaDto> alimentos) =>
        JsonSerializer.Serialize(alimentos, Json);

    /// <summary>Totales del tiempo de comida, precalculados para no recorrer el JSON al leer.</summary>
    internal static string SerializarTotales(List<AlimentoEnDietaDto> alimentos)
    {
        decimal Suma(Func<AlimentoEnDietaDto, decimal> por100) =>
            Math.Round(alimentos.Sum(a => por100(a) * a.Gramos / 100), 2);

        return JsonSerializer.Serialize(new
        {
            energia       = Suma(a => a.Energia100),
            proteinas     = Suma(a => a.Proteinas100),
            grasas        = Suma(a => a.Grasas100),
            carbohidratos = Suma(a => a.Carbohidratos100),
            fibra         = Suma(a => a.Fibra100),
        }, Json);
    }
}

/* ── Consultas ─────────────────────────────────────────────────── */

public record GetDietasQuery(Guid PacienteId, Guid NutricionistaId) : IRequest<List<DietaDto>>;

public class GetDietasQueryHandler(IDietaRepository repo)
    : IRequestHandler<GetDietasQuery, List<DietaDto>>
{
    public async Task<List<DietaDto>> Handle(GetDietasQuery request, CancellationToken ct)
    {
        if (!await repo.PacientePerteneceAsync(request.PacienteId, request.NutricionistaId, ct))
            throw new KeyNotFoundException("Paciente no encontrado.");

        var dietas = await repo.ObtenerPorPacienteAsync(request.PacienteId, request.NutricionistaId, ct);
        return dietas.Select(DietaMapper.ToDto).ToList();
    }
}

public record GetDietaByIdQuery(Guid Id, Guid NutricionistaId) : IRequest<DietaDto>;

public class GetDietaByIdQueryHandler(IDietaRepository repo)
    : IRequestHandler<GetDietaByIdQuery, DietaDto>
{
    public async Task<DietaDto> Handle(GetDietaByIdQuery request, CancellationToken ct)
    {
        var dieta = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Dieta no encontrada.");
        return DietaMapper.ToDto(dieta);
    }
}

/* ── Comando ───────────────────────────────────────────────────── */

/// <summary>
/// Alta o actualización del plan completo. El constructor del frontend
/// autoguarda con debounce y manda siempre los 7 días, así que el handler
/// regraba los días y tiempos en lugar de intentar un diff parcial.
/// </summary>
public record GuardarDietaCommand(Guid Id, Guid NutricionistaId, GuardarDietaRequest Data)
    : IRequest<DietaDto>;

public class GuardarDietaCommandHandler(IDietaRepository repo)
    : IRequestHandler<GuardarDietaCommand, DietaDto>
{
    public async Task<DietaDto> Handle(GuardarDietaCommand request, CancellationToken ct)
    {
        var d = request.Data;

        if (!await repo.PacientePerteneceAsync(d.PacienteId, request.NutricionistaId, ct))
            throw new KeyNotFoundException("Paciente no encontrado.");

        var dieta = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct);

        if (dieta is null)
        {
            dieta = new Dieta
            {
                Id            = request.Id,
                PacienteId    = d.PacienteId,
                FechaCreacion = DateTime.UtcNow,
            };
            await repo.AgregarAsync(dieta, ct);
        }
        else if (dieta.PacienteId != d.PacienteId)
        {
            throw new InvalidOperationException("La dieta pertenece a otro paciente.");
        }

        dieta.Nombre                = d.Nombre.Trim();
        dieta.Fecha                 = d.Fecha;
        dieta.CaloriasObjetivo      = d.Requerimientos.Kcal;
        dieta.ProteinasObjetivo     = d.Requerimientos.ProteinasG;
        dieta.CarbohidratosObjetivo = d.Requerimientos.CarbohidratosG;
        dieta.GrasasObjetivo        = d.Requerimientos.GrasasG;
        dieta.ModoIntercambios      = d.ModoIntercambios;
        dieta.FechaActualizacion    = DateTime.UtcNow;

        /* Los días se reutilizan y solo se reemplazan sus tiempos de comida.
           Borrar y recrear el día en cada autoguardado chocaría con el índice
           único (DietaId, DiaSemana) y dispararía el cascade de la FK. */
        foreach (var dia in d.Dias.OrderBy(x => x.DiaSemana))
        {
            var diaEntidad = dieta.Dias.FirstOrDefault(x => x.DiaSemana == dia.DiaSemana);

            if (diaEntidad is null)
            {
                // Sin Id ni FK explícitos: si se asignan a mano, EF ve una clave
                // ya poblada, marca la entidad como Modified y emite UPDATE en
                // vez de INSERT. Dejándolos vacíos los genera y hace el fixup.
                diaEntidad = new DiaDieta { DiaSemana = dia.DiaSemana };
                dieta.Dias.Add(diaEntidad);
            }
            else if (diaEntidad.TiemposComida.Count > 0)
            {
                repo.EliminarTiempos(diaEntidad.TiemposComida.ToList());
                diaEntidad.TiemposComida.Clear();
            }

            var orden = 0;
            foreach (var tiempo in dia.Tiempos)
            {
                // El frontend genera ids locales para los tiempos; el servidor
                // asigna los definitivos y los devuelve en la respuesta.
                diaEntidad.TiemposComida.Add(new TiempoComida
                {
                    Nombre        = tiempo.Nombre,
                    AlimentosJson = DietaMapper.Serializar(tiempo.Alimentos),
                    TotalesJson   = DietaMapper.SerializarTotales(tiempo.Alimentos),
                    Orden         = orden++,
                });
            }
        }

        // Días que el plan dejó de incluir: el cascade se lleva sus tiempos.
        var diasEnviados = d.Dias.Select(x => x.DiaSemana).ToHashSet();
        var sobrantes = dieta.Dias.Where(x => !diasEnviados.Contains(x.DiaSemana)).ToList();
        if (sobrantes.Count > 0)
        {
            repo.EliminarDias(sobrantes);
            foreach (var sobrante in sobrantes) dieta.Dias.Remove(sobrante);
        }

        await repo.GuardarCambiosAsync(ct);

        return DietaMapper.ToDto(dieta);
    }
}

public record EliminarDietaCommand(Guid Id, Guid NutricionistaId) : IRequest<Unit>;

public class EliminarDietaCommandHandler(IDietaRepository repo)
    : IRequestHandler<EliminarDietaCommand, Unit>
{
    public async Task<Unit> Handle(EliminarDietaCommand request, CancellationToken ct)
    {
        var dieta = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Dieta no encontrada.");

        repo.Eliminar(dieta);
        await repo.GuardarCambiosAsync(ct);

        return Unit.Value;
    }
}
