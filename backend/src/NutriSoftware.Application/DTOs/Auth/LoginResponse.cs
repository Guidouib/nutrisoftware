namespace NutriSoftware.Application.DTOs.Auth;

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    string Email,
    string NombreCompleto,
    string Rol
);
