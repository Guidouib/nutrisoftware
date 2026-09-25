namespace NutriSoftware.Application.DTOs.Auth;

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    string Email,
    string NombreCompleto,
    string Rol,

    /// <summary>
    /// Situacion de la suscripcion. Viaja aca porque, con la suscripcion
    /// vencida, el resto del API responde 402: el login es el unico lugar
    /// donde el frontend puede enterarse de por que esta bloqueado.
    /// </summary>
    string? EstadoSuscripcion = null,
    DateOnly? SuscripcionHasta = null,
    int? DiasRestantes = null
);
