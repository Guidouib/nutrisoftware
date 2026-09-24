namespace NutriSoftware.Application.DTOs.Auth;

/// <summary>Cuerpo del <c>POST /api/auth/refresh</c>.</summary>
public record RefreshRequest(string RefreshToken);
