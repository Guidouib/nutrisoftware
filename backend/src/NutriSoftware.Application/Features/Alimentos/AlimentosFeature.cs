using MediatR;
using NutriSoftware.Application.DTOs.Alimentos;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Domain.Interfaces;
using System.Text.Json;

namespace NutriSoftware.Application.Features.Alimentos;

/* ── Queries ── */

public record GetAlimentosQuery(Guid NutricionistaId, string? Fuente, string? Categoria, string? Busqueda)
    : IRequest<List<AlimentoDto>>;

public class GetAlimentosQueryHandler(IAlimentoRepository repo)
    : IRequestHandler<GetAlimentosQuery, List<AlimentoDto>>
{
    public async Task<List<AlimentoDto>> Handle(GetAlimentosQuery request, CancellationToken ct)
    {
        var alimentos = await repo.ObtenerAsync(
            request.NutricionistaId, request.Fuente, request.Categoria, request.Busqueda, ct);
        return alimentos.Select(AlimentoMapper.ToDto).ToList();
    }
}

/* ── Commands ── */

public record CrearAlimentoCommand(Guid NutricionistaId, CrearAlimentoRequest Data) : IRequest<AlimentoDto>;

public class CrearAlimentoCommandHandler(IAlimentoRepository repo)
    : IRequestHandler<CrearAlimentoCommand, AlimentoDto>
{
    public async Task<AlimentoDto> Handle(CrearAlimentoCommand request, CancellationToken ct)
    {
        var d = request.Data;
        var micronutrientes = new Dictionary<string, decimal?>();
        if (d.Sodio.HasValue)  micronutrientes["sodio"]  = d.Sodio;
        if (d.Calcio.HasValue) micronutrientes["calcio"] = d.Calcio;
        if (d.Hierro.HasValue) micronutrientes["hierro"] = d.Hierro;

        var alimento = new Alimento
        {
            Id                 = Guid.NewGuid(),
            Nombre             = d.Nombre.Trim(),
            Fuente             = FuenteAlimento.Personalizado,
            Categoria          = d.Categoria?.Trim(),
            Energia            = d.Energia,
            Proteinas          = d.Proteinas,
            Grasas             = d.Grasas,
            Carbohidratos      = d.Carbohidratos,
            Fibra              = d.Fibra,
            MicronutrientesJson = micronutrientes.Count > 0
                ? JsonSerializer.Serialize(micronutrientes)
                : null,
            EsPersonalizado    = true,
            NutricionistaId    = request.NutricionistaId,
            FechaCreacion      = DateTime.UtcNow,
        };

        await repo.AgregarAsync(alimento, ct);
        await repo.GuardarCambiosAsync(ct);
        return AlimentoMapper.ToDto(alimento);
    }
}

public record EliminarAlimentoCommand(Guid Id, Guid NutricionistaId) : IRequest;

public class EliminarAlimentoCommandHandler(IAlimentoRepository repo)
    : IRequestHandler<EliminarAlimentoCommand>
{
    public async Task Handle(EliminarAlimentoCommand request, CancellationToken ct)
    {
        var alimento = await repo.ObtenerPorIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException("Alimento no encontrado.");

        if (alimento.EsPersonalizado && alimento.NutricionistaId != request.NutricionistaId)
            throw new UnauthorizedAccessException("No tienes permiso para eliminar este alimento.");

        if (!alimento.EsPersonalizado)
            throw new InvalidOperationException("Solo se pueden eliminar alimentos personalizados.");

        await repo.EliminarAsync(alimento, ct);
        await repo.GuardarCambiosAsync(ct);
    }
}

/* ── Mapper ── */
internal static class AlimentoMapper
{
    internal static AlimentoDto ToDto(Alimento a)
    {
        decimal? sodio = null, calcio = null, hierro = null;
        Dictionary<string, decimal?>? micronutrientes = null;

        if (a.MicronutrientesJson is not null)
        {
            try
            {
                var micro = JsonSerializer.Deserialize<Dictionary<string, decimal?>>(a.MicronutrientesJson);
                if (micro is not null)
                {
                    micro.TryGetValue("sodio",  out sodio);
                    micro.TryGetValue("calcio", out calcio);
                    micro.TryGetValue("hierro", out hierro);
                    micronutrientes = micro;
                }
            }
            catch { /* ignore malformed JSON */ }
        }

        return new AlimentoDto(
            a.Id, a.Nombre, a.Fuente.ToString(), a.Categoria,
            a.Energia, a.Proteinas, a.Grasas, a.Carbohidratos, a.Fibra,
            sodio, calcio, hierro,
            a.EsPersonalizado, a.FechaCreacion,
            micronutrientes
        );
    }
}
