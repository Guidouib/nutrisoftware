namespace NutriSoftware.Application.DTOs.Dietas;

/// <summary>
/// Cuerpo del <c>PUT /api/dietas/{id}</c>. El constructor del frontend
/// autoguarda el plan completo cada 2 segundos, así que la petición trae
/// siempre los 7 días enteros y el servidor los regraba.
/// </summary>
public record GuardarDietaRequest(
    Guid PacienteId,
    DateOnly Fecha,
    string Nombre,
    RequerimientosDto Requerimientos,
    List<DiaDietaDto> Dias,
    bool ModoIntercambios
);
