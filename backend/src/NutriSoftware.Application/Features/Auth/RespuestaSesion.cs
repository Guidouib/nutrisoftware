using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Domain;
using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Application.Features.Auth;

/// <summary>
/// Arma la respuesta de sesión con el estado de la suscripción.
///
/// Compartida por login, registro y renovación, para que los tres informen lo
/// mismo y el frontend no tenga que adivinar de dónde viene la respuesta.
/// </summary>
public static class RespuestaSesion
{
    public static LoginResponse Crear(
        Usuario usuario, string accessToken, string refreshToken, string nombreCompleto)
    {
        var n = usuario.Nutricionista;
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        return new LoginResponse(
            accessToken,
            refreshToken,
            usuario.Email,
            nombreCompleto,
            usuario.Rol.ToString(),
            // Los usuarios sin ficha de nutricionista —un paciente, por
            // ejemplo— no tienen suscripción que informar.
            EstadoSuscripcion: n is null ? null : Suscripcion.Estado(n, hoy).ToString(),
            SuscripcionHasta: n?.SuscripcionHasta,
            DiasRestantes: n is null ? null : Suscripcion.DiasRestantes(n, hoy));
    }
}
