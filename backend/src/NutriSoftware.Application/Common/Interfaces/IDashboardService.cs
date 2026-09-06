namespace NutriSoftware.Application.Common.Interfaces;

public record DashboardStatsDto(
    int PacientesActivos,
    int CitasHoy,
    int CitasMes,
    int PacientesMes,
    List<ProximaCitaDto> ProximasCitas
);

public record ProximaCitaDto(
    Guid Id,
    Guid PacienteId,
    string PacienteNombre,
    DateTime FechaHora,
    string TipoConsulta,
    int DuracionMinutos
);

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(Guid nutricionistaId, CancellationToken ct);
}
