using MediatR;
using NutriSoftware.Application.DTOs.Pacientes;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Pacientes;

public record CrearPacienteCommand(Guid NutricionistaId, CrearPacienteRequest Data)
    : IRequest<PacienteDto>;

public class CrearPacienteCommandHandler(IPacienteRepository repo)
    : IRequestHandler<CrearPacienteCommand, PacienteDto>
{
    public async Task<PacienteDto> Handle(CrearPacienteCommand request, CancellationToken ct)
    {
        var d = request.Data;
        var paciente = new Paciente
        {
            Id              = Guid.NewGuid(),
            NutricionistaId = request.NutricionistaId,
            Nombres         = d.Nombres.Trim(),
            Apellidos       = d.Apellidos.Trim(),
            FechaNacimiento = d.FechaNacimiento,
            Sexo            = d.Sexo,
            Email           = d.Email?.Trim().ToLowerInvariant(),
            Telefono        = d.Telefono?.Trim(),
            Dni             = d.Dni?.Trim(),
            Direccion       = d.Direccion?.Trim(),
            FotoUrl         = d.FotoUrl?.Trim(),
            Notas           = d.Notas?.Trim(),
            Activo          = true,
            FechaCreacion   = DateTime.UtcNow,
        };

        await repo.AgregarAsync(paciente, ct);
        await repo.GuardarCambiosAsync(ct);

        return PacienteMapper.ToDto(paciente);
    }
}
