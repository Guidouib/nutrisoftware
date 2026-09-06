namespace NutriSoftware.Application.DTOs.Citas;

public record CrearCitaRequest(
    Guid PacienteId,
    DateTime FechaHora,
    string TipoConsulta,
    string Modalidad,
    int DuracionMinutos,
    string? Notas
);

public record ActualizarCitaRequest(
    DateTime FechaHora,
    string TipoConsulta,
    string Modalidad,
    string Estado,
    int DuracionMinutos,
    string? Notas
);

public record CambiarEstadoRequest(string Estado);
