using MediatR;
using NutriSoftware.Application.DTOs.Citas;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Citas;

public record GetCitasQuery(Guid NutricionistaId, int? Mes, int? Anio, Guid? PacienteId)
    : IRequest<List<CitaDto>>;

public class GetCitasQueryHandler(ICitaRepository repo)
    : IRequestHandler<GetCitasQuery, List<CitaDto>>
{
    public async Task<List<CitaDto>> Handle(GetCitasQuery request, CancellationToken ct)
    {
        var citas = await repo.ObtenerPorNutricionistaAsync(
            request.NutricionistaId, request.Mes, request.Anio, request.PacienteId, ct);

        return citas.Select(c => new CitaDto(
            c.Id,
            c.PacienteId,
            $"{c.Paciente.Nombres} {c.Paciente.Apellidos}",
            c.FechaHora,
            c.TipoConsulta.ToString(),
            c.Modalidad.ToString(),
            c.Estado.ToString(),
            c.DuracionMinutos,
            c.Notas,
            c.FechaCreacion
        )).ToList();
    }
}
