namespace NutriSoftware.Application.DTOs.Auth;

public record VerificarRequest(string Token);

public record ReenviarVerificacionRequest(string Email);
