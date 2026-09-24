namespace NutriSoftware.Application.Common.Interfaces;

public record DashboardStatsDto(
    int PacientesActivos,
    int CitasHoy,
    int CitasMes,
    int PacientesMes,
    List<ProximaCitaDto> ProximasCitas,

    /// <summary>
    /// Evaluaciones registradas en el mes en curso. Va al final como
    /// parámetro opcional para no romper a quien ya construye el DTO.
    /// El dashboard mostraba <c>CitasMes</c> bajo la etiqueta
    /// «Evaluaciones este mes», que contaba citas.
    /// </summary>
    int EvaluacionesMes = 0,

    /// <summary>Planes alimentarios creados; la tarjeta estaba fija en 0.</summary>
    int DietasGeneradas = 0,

    /// <summary>Recordatorios de consumo cargados en el mes.</summary>
    int RecordatoriosMes = 0
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
