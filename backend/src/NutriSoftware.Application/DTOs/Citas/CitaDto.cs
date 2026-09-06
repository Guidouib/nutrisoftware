namespace NutriSoftware.Application.DTOs.Citas;

public record CitaDto(
    Guid Id,
    Guid PacienteId,
    string PacienteNombre,
    DateTime FechaHora,
    string TipoConsulta,
    string Modalidad,
    string Estado,
    int DuracionMinutos,
    string? Notas,
    DateTime FechaCreacion
);
