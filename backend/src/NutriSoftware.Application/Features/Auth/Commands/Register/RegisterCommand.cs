using MediatR;
using NutriSoftware.Application.DTOs.Auth;

namespace NutriSoftware.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Email,
    string Password,
    string Nombres,
    string Apellidos,
    string? Especialidad,
    string? Telefono,
    /// <summary>Origen del frontend, para armar el enlace de verificacion.</summary>
    string UrlBase,
    /// <summary>Dias de prueba que se le dan a la cuenta nueva.</summary>
    int DiasPrueba
) : IRequest<RegistroResponse>;
