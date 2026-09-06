namespace NutriSoftware.Application.DTOs.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string Nombres,
    string Apellidos,
    string? Especialidad,
    string? Telefono
);
