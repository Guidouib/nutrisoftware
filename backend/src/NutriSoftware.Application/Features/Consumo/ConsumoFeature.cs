using System.Text.Json;
using MediatR;
using NutriSoftware.Application.DTOs.Consumo;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Consumo;

internal static class ConsumoMapper
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    internal static ItemConsumoDto ToDto(ItemConsumo i)
    {
        var composicion = Deserializar(i.ComposicionJson);
        return new ItemConsumoDto(
            i.Id,
            i.TiempoComida,
            i.Orden,
            i.AlimentoId,
            i.NombreAlimento,
            i.Gramos,
            i.OrigenAlimento,
            composicion,
            CalculadoraConsumo.Aporte(composicion, i.Gramos));
    }

    internal static RegistroConsumoDto ToDto(RegistroConsumo r)
    {
        var items = r.Items.OrderBy(i => i.Orden).Select(ToDto).ToList();
        return new RegistroConsumoDto(
            r.Id, r.PacienteId, r.Fecha, r.Titulo, r.Observaciones,
            r.FechaCreacion, r.FechaActualizacion,
            items,
            CalculadoraConsumo.Totalizar(items));
    }

    internal static RegistroConsumoResumenDto ToResumen(RegistroConsumo r)
    {
        var items = r.Items.Select(ToDto).ToList();
        var totales = CalculadoraConsumo.Totalizar(items);
        return new RegistroConsumoResumenDto(
            r.Id, r.PacienteId, r.Fecha, r.Titulo, items.Count,
            totales.Valores.GetValueOrDefault("energiaKcal"),
            totales.Valores.GetValueOrDefault("proteinas"),
            r.FechaCreacion);
    }

    /// <summary>Un JSON corrupto deja el item sin composición, no tumba el registro entero.</summary>
    private static Dictionary<string, decimal?> Deserializar(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, decimal?>>(json, Json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    internal static string Serializar(Dictionary<string, decimal?> composicion) =>
        JsonSerializer.Serialize(composicion, Json);
}

/* ── Consultas ── */

public record ListarConsumoQuery(Guid PacienteId, Guid NutricionistaId)
    : IRequest<List<RegistroConsumoResumenDto>>;

public class ListarConsumoQueryHandler(IConsumoRepository repo)
    : IRequestHandler<ListarConsumoQuery, List<RegistroConsumoResumenDto>>
{
    public async Task<List<RegistroConsumoResumenDto>> Handle(
        ListarConsumoQuery request, CancellationToken ct)
    {
        if (!await repo.PacientePerteneceAsync(request.PacienteId, request.NutricionistaId, ct))
            throw new KeyNotFoundException("Paciente no encontrado.");

        var registros = await repo.ObtenerPorPacienteAsync(
            request.PacienteId, request.NutricionistaId, ct);

        return registros.Select(ConsumoMapper.ToResumen).ToList();
    }
}

public record ObtenerConsumoQuery(Guid Id, Guid NutricionistaId)
    : IRequest<RegistroConsumoDto>;

public class ObtenerConsumoQueryHandler(IConsumoRepository repo)
    : IRequestHandler<ObtenerConsumoQuery, RegistroConsumoDto>
{
    public async Task<RegistroConsumoDto> Handle(ObtenerConsumoQuery request, CancellationToken ct)
    {
        var registro = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Recordatorio no encontrado.");

        return ConsumoMapper.ToDto(registro);
    }
}

/* ── Comandos ── */

public record GuardarConsumoCommand(
    Guid Id, GuardarRegistroConsumoRequest Data, Guid NutricionistaId)
    : IRequest<RegistroConsumoDto>;

/// <summary>
/// Upsert idempotente, igual que el constructor de dietas: la pantalla genera
/// el id al abrir el recordatorio nuevo y autoguarda el contenido completo
/// sobre esa misma ruta.
/// </summary>
public class GuardarConsumoCommandHandler(IConsumoRepository repo)
    : IRequestHandler<GuardarConsumoCommand, RegistroConsumoDto>
{
    public async Task<RegistroConsumoDto> Handle(GuardarConsumoCommand request, CancellationToken ct)
    {
        var d = request.Data;

        if (!await repo.PacientePerteneceAsync(d.PacienteId, request.NutricionistaId, ct))
            throw new KeyNotFoundException("Paciente no encontrado.");

        // InvalidOperationException y no ArgumentException: es la que el
        // ExceptionMiddleware traduce a 400, y la que usa el resto del
        // proyecto para las validaciones de negocio.
        if (string.IsNullOrWhiteSpace(d.Titulo))
            throw new InvalidOperationException("El recordatorio necesita un título.");

        foreach (var item in d.Items)
        {
            if (string.IsNullOrWhiteSpace(item.NombreAlimento))
                throw new InvalidOperationException("Hay un alimento sin nombre en el recordatorio.");

            if (item.Gramos <= 0)
                throw new InvalidOperationException(
                    $"La cantidad de «{item.NombreAlimento}» debe ser mayor que cero.");
        }

        var registro = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct);

        if (registro is null)
        {
            registro = new RegistroConsumo
            {
                Id = request.Id,
                PacienteId = d.PacienteId,
                NutricionistaId = request.NutricionistaId,
                FechaCreacion = DateTime.UtcNow,
            };
            await repo.AgregarAsync(registro, ct);
        }
        else if (registro.Items.Count > 0)
        {
            // Se reemplazan todos: el cuerpo trae el recordatorio completo.
            repo.EliminarItems(registro.Items.ToList());
            registro.Items.Clear();
        }

        registro.Fecha = d.Fecha;
        registro.Titulo = d.Titulo.Trim();
        registro.Observaciones = string.IsNullOrWhiteSpace(d.Observaciones)
            ? null
            : d.Observaciones.Trim();
        registro.FechaActualizacion = DateTime.UtcNow;

        foreach (var item in d.Items)
        {
            // Sin asignar Id: con la clave ya poblada EF marca la entidad como
            // Modified y emite UPDATE en vez de INSERT, el UPDATE afecta 0
            // filas y estalla como DbUpdateConcurrencyException.
            registro.Items.Add(new ItemConsumo
            {
                TiempoComida = item.TiempoComida.Trim(),
                Orden = item.Orden,
                AlimentoId = item.AlimentoId,
                NombreAlimento = item.NombreAlimento.Trim(),
                Gramos = item.Gramos,
                OrigenAlimento = Domain.Nutrientes.NormalizarOrigen(item.OrigenAlimento),
                ComposicionJson = ConsumoMapper.Serializar(item.Composicion),
            });
        }

        await repo.GuardarCambiosAsync(ct);

        var guardado = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)!;
        return ConsumoMapper.ToDto(guardado!);
    }
}

public record EliminarConsumoCommand(Guid Id, Guid NutricionistaId) : IRequest;

public class EliminarConsumoCommandHandler(IConsumoRepository repo)
    : IRequestHandler<EliminarConsumoCommand>
{
    public async Task Handle(EliminarConsumoCommand request, CancellationToken ct)
    {
        var registro = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Recordatorio no encontrado.");

        // Solo la cabecera: la FK de los items esta en cascada y Postgres se
        // los lleva. Un DELETE explicito adicional afectaria 0 filas y EF lo
        // tomaria como conflicto de concurrencia.
        repo.Eliminar(registro);
        await repo.GuardarCambiosAsync(ct);
    }
}
