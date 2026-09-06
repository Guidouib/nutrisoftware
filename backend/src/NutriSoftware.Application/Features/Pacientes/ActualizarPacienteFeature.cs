using MediatR;
using NutriSoftware.Application.DTOs.Pacientes;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Pacientes;

public record ActualizarPacienteCommand(Guid Id, Guid NutricionistaId, ActualizarPacienteRequest Data)
    : IRequest<PacienteDto>;

public class ActualizarPacienteCommandHandler(IPacienteRepository repo)
    : IRequestHandler<ActualizarPacienteCommand, PacienteDto>
{
    public async Task<PacienteDto> Handle(ActualizarPacienteCommand request, CancellationToken ct)
    {
        var paciente = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        var d = request.Data;
        paciente.Nombres         = d.Nombres.Trim();
        paciente.Apellidos       = d.Apellidos.Trim();
        paciente.FechaNacimiento = d.FechaNacimiento;
        paciente.Sexo            = d.Sexo;
        paciente.Email           = d.Email?.Trim().ToLowerInvariant();
        paciente.Telefono        = d.Telefono?.Trim();
        paciente.Dni             = d.Dni?.Trim();
        paciente.Direccion       = d.Direccion?.Trim();
        paciente.FotoUrl         = d.FotoUrl?.Trim();
        paciente.Notas           = d.Notas?.Trim();

        await repo.GuardarCambiosAsync(ct);

        return PacienteMapper.ToDto(paciente);
    }
}

public record ToggleEstadoPacienteCommand(Guid Id, Guid NutricionistaId) : IRequest<PacienteDto>;

public class ToggleEstadoPacienteCommandHandler(IPacienteRepository repo)
    : IRequestHandler<ToggleEstadoPacienteCommand, PacienteDto>
{
    public async Task<PacienteDto> Handle(ToggleEstadoPacienteCommand request, CancellationToken ct)
    {
        var paciente = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        paciente.Activo = !paciente.Activo;
        await repo.GuardarCambiosAsync(ct);

        return PacienteMapper.ToDto(paciente);
    }
}
