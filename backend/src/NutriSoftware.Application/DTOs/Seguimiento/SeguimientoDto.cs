namespace NutriSoftware.Application.DTOs.Seguimiento;

public record MedidasControlDto(
    decimal? PerimetroAbdominal,
    decimal? PerimetroCintura,
    decimal? PerimetroCadera,
    decimal? PerimetroBrazo
);

public record SeguimientoDto(
    Guid Id,
    Guid PacienteId,
    DateOnly Fecha,
    decimal Peso,
    decimal? Talla,
    MedidasControlDto Medidas,
    int Cumplimiento,
    string? Observaciones
);

public record CrearSeguimientoRequest(
    Guid PacienteId,
    DateOnly Fecha,
    decimal Peso,
    decimal? Talla,
    MedidasControlDto? Medidas,
    int Cumplimiento,
    string? Observaciones
);

/// <summary>Meta de peso del tratamiento, usada como línea de referencia en los gráficos.</summary>
public record MetaPacienteDto(Guid PacienteId, decimal? PesoObjetivo);
