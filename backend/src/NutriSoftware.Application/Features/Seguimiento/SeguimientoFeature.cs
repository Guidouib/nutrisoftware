using System.Text.Json;
using MediatR;
using NutriSoftware.Application.DTOs.Seguimiento;
using NutriSoftware.Domain.Interfaces;
using Entidad = NutriSoftware.Domain.Entities.Seguimiento;

namespace NutriSoftware.Application.Features.Seguimiento;

internal static class SeguimientoMapper
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly MedidasControlDto SinMedidas = new(null, null, null, null);

    internal static SeguimientoDto ToDto(Entidad s) => new(
        s.Id,
        s.PacienteId,
        s.Fecha,
        s.Peso,
        s.Talla,
        Deserializar(s.MedidasJson),
        s.Cumplimiento,
        s.Observaciones
    );

    private static MedidasControlDto Deserializar(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return SinMedidas;
        try
        {
            return JsonSerializer.Deserialize<MedidasControlDto>(json, Json) ?? SinMedidas;
        }
        catch (JsonException)
        {
            return SinMedidas;
        }
    }

    internal static string? Serializar(MedidasControlDto? medidas)
    {
        if (medidas is null) return null;
        var vacio = medidas is { PerimetroAbdominal: null, PerimetroCintura: null, PerimetroCadera: null, PerimetroBrazo: null };
        return vacio ? null : JsonSerializer.Serialize(medidas, Json);
    }
}

/* ── Controles ─────────────────────────────────────────────────── */

public record GetSeguimientosQuery(Guid PacienteId, Guid NutricionistaId) : IRequest<List<SeguimientoDto>>;

public class GetSeguimientosQueryHandler(ISeguimientoRepository repo)
    : IRequestHandler<GetSeguimientosQuery, List<SeguimientoDto>>
{
    public async Task<List<SeguimientoDto>> Handle(GetSeguimientosQuery request, CancellationToken ct)
    {
        _ = await repo.ObtenerPacienteAsync(request.PacienteId, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        var controles = await repo.ObtenerPorPacienteAsync(request.PacienteId, request.NutricionistaId, ct);
        return controles.Select(SeguimientoMapper.ToDto).ToList();
    }
}

public record CrearSeguimientoCommand(Guid NutricionistaId, CrearSeguimientoRequest Data)
    : IRequest<SeguimientoDto>;

public class CrearSeguimientoCommandHandler(ISeguimientoRepository repo)
    : IRequestHandler<CrearSeguimientoCommand, SeguimientoDto>
{
    public async Task<SeguimientoDto> Handle(CrearSeguimientoCommand request, CancellationToken ct)
    {
        var d = request.Data;

        _ = await repo.ObtenerPacienteAsync(d.PacienteId, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        if (d.Peso <= 0)
            throw new InvalidOperationException("El peso debe ser mayor a 0.");

        if (d.Cumplimiento is < 1 or > 5)
            throw new InvalidOperationException("El cumplimiento debe estar entre 1 y 5.");

        var control = new Entidad
        {
            Id            = Guid.NewGuid(),
            PacienteId    = d.PacienteId,
            Fecha         = d.Fecha,
            Peso          = d.Peso,
            Talla         = d.Talla,
            MedidasJson   = SeguimientoMapper.Serializar(d.Medidas),
            Cumplimiento  = d.Cumplimiento,
            Observaciones = d.Observaciones?.Trim(),
            FechaCreacion = DateTime.UtcNow,
        };

        await repo.AgregarAsync(control, ct);
        await repo.GuardarCambiosAsync(ct);

        return SeguimientoMapper.ToDto(control);
    }
}

public record EliminarSeguimientoCommand(Guid Id, Guid NutricionistaId) : IRequest<Unit>;

public class EliminarSeguimientoCommandHandler(ISeguimientoRepository repo)
    : IRequestHandler<EliminarSeguimientoCommand, Unit>
{
    public async Task<Unit> Handle(EliminarSeguimientoCommand request, CancellationToken ct)
    {
        var control = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Control no encontrado.");

        repo.Eliminar(control);
        await repo.GuardarCambiosAsync(ct);

        return Unit.Value;
    }
}

/* ── Meta de peso ──────────────────────────────────────────────── */

public record GetMetaQuery(Guid PacienteId, Guid NutricionistaId) : IRequest<MetaPacienteDto>;

public class GetMetaQueryHandler(ISeguimientoRepository repo)
    : IRequestHandler<GetMetaQuery, MetaPacienteDto>
{
    public async Task<MetaPacienteDto> Handle(GetMetaQuery request, CancellationToken ct)
    {
        var paciente = await repo.ObtenerPacienteAsync(request.PacienteId, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        return new MetaPacienteDto(paciente.Id, paciente.PesoObjetivo);
    }
}

public record GuardarMetaCommand(Guid PacienteId, Guid NutricionistaId, decimal? PesoObjetivo)
    : IRequest<MetaPacienteDto>;

public class GuardarMetaCommandHandler(ISeguimientoRepository repo)
    : IRequestHandler<GuardarMetaCommand, MetaPacienteDto>
{
    public async Task<MetaPacienteDto> Handle(GuardarMetaCommand request, CancellationToken ct)
    {
        var paciente = await repo.ObtenerPacienteAsync(request.PacienteId, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        if (request.PesoObjetivo is <= 0)
            throw new InvalidOperationException("El peso objetivo debe ser mayor a 0.");

        paciente.PesoObjetivo = request.PesoObjetivo;
        await repo.GuardarCambiosAsync(ct);

        return new MetaPacienteDto(paciente.Id, paciente.PesoObjetivo);
    }
}
