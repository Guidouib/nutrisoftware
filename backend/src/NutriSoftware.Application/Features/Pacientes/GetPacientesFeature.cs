using MediatR;
using NutriSoftware.Application.DTOs.Pacientes;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Pacientes;

public record GetPacientesQuery(Guid NutricionistaId, string? Busqueda, bool? Activo)
    : IRequest<List<PacienteDto>>;

public class GetPacientesQueryHandler(IPacienteRepository repo)
    : IRequestHandler<GetPacientesQuery, List<PacienteDto>>
{
    public async Task<List<PacienteDto>> Handle(GetPacientesQuery request, CancellationToken ct)
    {
        var pacientes = await repo.ObtenerPorNutricionistaAsync(request.NutricionistaId, request.Busqueda, request.Activo, ct);
        return pacientes.Select(PacienteMapper.ToDto).ToList();
    }
}

public record GetPacienteByIdQuery(Guid Id, Guid NutricionistaId) : IRequest<PacienteDto>;

public class GetPacienteByIdQueryHandler(IPacienteRepository repo)
    : IRequestHandler<GetPacienteByIdQuery, PacienteDto>
{
    public async Task<PacienteDto> Handle(GetPacienteByIdQuery request, CancellationToken ct)
    {
        var paciente = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");
        return PacienteMapper.ToDto(paciente);
    }
}

internal static class PacienteMapper
{
    internal static PacienteDto ToDto(Domain.Entities.Paciente p)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var edad = hoy.Year - p.FechaNacimiento.Year;
        if (p.FechaNacimiento > hoy.AddYears(-edad)) edad--;

        var ultimaCita = p.Citas.Count > 0
            ? p.Citas.OrderByDescending(c => c.FechaHora).First().FechaHora
            : (DateTime?)null;

        return new PacienteDto(
            p.Id,
            p.Nombres,
            p.Apellidos,
            $"{p.Nombres} {p.Apellidos}",
            p.FechaNacimiento,
            edad,
            p.Sexo,
            p.Email,
            p.Telefono,
            p.Dni,
            p.Direccion,
            p.FotoUrl,
            p.Notas,
            p.Activo,
            p.FechaCreacion,
            ultimaCita
        );
    }
}
