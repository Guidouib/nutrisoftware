using MediatR;
using NutriSoftware.Application.DTOs.Citas;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Citas;

public record ActualizarCitaCommand(Guid Id, Guid NutricionistaId, ActualizarCitaRequest Data)
    : IRequest<CitaDto>;

public class ActualizarCitaCommandHandler(ICitaRepository repo)
    : IRequestHandler<ActualizarCitaCommand, CitaDto>
{
    public async Task<CitaDto> Handle(ActualizarCitaCommand request, CancellationToken ct)
    {
        var cita = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Cita no encontrada.");

        if (!Enum.TryParse<TipoConsulta>(request.Data.TipoConsulta, true, out var tipo))
            throw new InvalidOperationException($"TipoConsulta inválido: {request.Data.TipoConsulta}");

        if (!Enum.TryParse<ModalidadCita>(request.Data.Modalidad, true, out var modalidad))
            throw new InvalidOperationException($"Modalidad inválida: {request.Data.Modalidad}");

        if (!Enum.TryParse<EstadoCita>(request.Data.Estado, true, out var estado))
            throw new InvalidOperationException($"Estado inválido: {request.Data.Estado}");

        cita.FechaHora       = request.Data.FechaHora;
        cita.TipoConsulta    = tipo;
        cita.Modalidad       = modalidad;
        cita.Estado          = estado;
        cita.DuracionMinutos = request.Data.DuracionMinutos > 0 ? request.Data.DuracionMinutos : 60;
        cita.Notas           = request.Data.Notas?.Trim();

        await repo.GuardarCambiosAsync(ct);

        return new CitaDto(
            cita.Id,
            cita.PacienteId,
            $"{cita.Paciente.Nombres} {cita.Paciente.Apellidos}",
            cita.FechaHora,
            cita.TipoConsulta.ToString(),
            cita.Modalidad.ToString(),
            cita.Estado.ToString(),
            cita.DuracionMinutos,
            cita.Notas,
            cita.FechaCreacion
        );
    }
}

public record CambiarEstadoCitaCommand(Guid Id, Guid NutricionistaId, string Estado) : IRequest<CitaDto>;

public class CambiarEstadoCitaCommandHandler(ICitaRepository repo)
    : IRequestHandler<CambiarEstadoCitaCommand, CitaDto>
{
    public async Task<CitaDto> Handle(CambiarEstadoCitaCommand request, CancellationToken ct)
    {
        var cita = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Cita no encontrada.");

        if (!Enum.TryParse<EstadoCita>(request.Estado, true, out var estado))
            throw new InvalidOperationException($"Estado inválido: {request.Estado}");

        cita.Estado = estado;
        await repo.GuardarCambiosAsync(ct);

        return new CitaDto(
            cita.Id,
            cita.PacienteId,
            $"{cita.Paciente.Nombres} {cita.Paciente.Apellidos}",
            cita.FechaHora,
            cita.TipoConsulta.ToString(),
            cita.Modalidad.ToString(),
            cita.Estado.ToString(),
            cita.DuracionMinutos,
            cita.Notas,
            cita.FechaCreacion
        );
    }
}

public record EliminarCitaCommand(Guid Id, Guid NutricionistaId) : IRequest;

public class EliminarCitaCommandHandler(ICitaRepository repo)
    : IRequestHandler<EliminarCitaCommand>
{
    public async Task Handle(EliminarCitaCommand request, CancellationToken ct)
    {
        var cita = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Cita no encontrada.");
        await repo.EliminarAsync(cita, ct);
        await repo.GuardarCambiosAsync(ct);
    }
}
