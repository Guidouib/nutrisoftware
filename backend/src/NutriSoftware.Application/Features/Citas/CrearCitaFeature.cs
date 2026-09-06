using MediatR;
using NutriSoftware.Application.DTOs.Citas;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Citas;

public record CrearCitaCommand(Guid NutricionistaId, CrearCitaRequest Data) : IRequest<CitaDto>;

public class CrearCitaCommandHandler(ICitaRepository citaRepo, IPacienteRepository pacienteRepo)
    : IRequestHandler<CrearCitaCommand, CitaDto>
{
    public async Task<CitaDto> Handle(CrearCitaCommand request, CancellationToken ct)
    {
        var paciente = await pacienteRepo.ObtenerPorIdAsync(request.Data.PacienteId, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        if (!Enum.TryParse<TipoConsulta>(request.Data.TipoConsulta, true, out var tipo))
            throw new InvalidOperationException($"TipoConsulta inválido: {request.Data.TipoConsulta}");

        if (!Enum.TryParse<ModalidadCita>(request.Data.Modalidad, true, out var modalidad))
            throw new InvalidOperationException($"Modalidad inválida: {request.Data.Modalidad}");

        var cita = new Cita
        {
            Id              = Guid.NewGuid(),
            PacienteId      = paciente.Id,
            NutricionistaId = request.NutricionistaId,
            FechaHora       = request.Data.FechaHora,
            TipoConsulta    = tipo,
            Modalidad       = modalidad,
            Estado          = EstadoCita.Programada,
            DuracionMinutos = request.Data.DuracionMinutos > 0 ? request.Data.DuracionMinutos : 60,
            Notas           = request.Data.Notas?.Trim(),
            FechaCreacion   = DateTime.UtcNow,
        };

        await citaRepo.AgregarAsync(cita, ct);
        await citaRepo.GuardarCambiosAsync(ct);

        return new CitaDto(
            cita.Id,
            cita.PacienteId,
            $"{paciente.Nombres} {paciente.Apellidos}",
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
