using MediatR;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Application.DTOs.Pacientes;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Pacientes;

public record CrearPacienteCommand(Guid NutricionistaId, CrearPacienteRequest Data)
    : IRequest<PacienteDto>;

public class CrearPacienteCommandHandler(IPacienteRepository repo, ILimitesPlan limites)
    : IRequestHandler<CrearPacienteCommand, PacienteDto>
{
    public async Task<PacienteDto> Handle(CrearPacienteCommand request, CancellationToken ct)
    {
        var d = request.Data;

        // El tope se aplica aca y no en la interfaz: una restriccion que solo
        // vive en el navegador no restringe nada.
        var tope = limites.MaxPacientes;
        var actuales = await repo.ContarActivosAsync(request.NutricionistaId, ct);

        if (actuales >= tope)
            throw new InvalidOperationException(
                $"Llegaste al limite de {tope} pacientes activos del plan. " +
                "Archiva alguno o escribinos para ampliarlo.");

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
