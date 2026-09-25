using MediatR;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Auth.Commands.Verificar;

public record VerificarCorreoCommand(string Token) : IRequest;

/// <summary>Canjea el token del enlace y deja la cuenta habilitada.</summary>
public class VerificarCorreoCommandHandler(IUsuarioRepository repo)
    : IRequestHandler<VerificarCorreoCommand>
{
    public async Task Handle(VerificarCorreoCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            throw new InvalidOperationException("El enlace de verificación no es válido.");

        var usuario = await repo.ObtenerPorTokenVerificacionAsync(request.Token, ct)
            ?? throw new InvalidOperationException(
                "El enlace no es válido o ya se usó. Pedí uno nuevo desde el login.");

        if (usuario.TokenVerificacionExpira is null || usuario.TokenVerificacionExpira <= DateTime.UtcNow)
            throw new InvalidOperationException(
                "El enlace venció. Pedí uno nuevo desde el login.");

        usuario.EmailVerificado = true;
        // El token se consume: de un solo uso.
        usuario.TokenVerificacion = null;
        usuario.TokenVerificacionExpira = null;

        await repo.GuardarCambiosAsync(ct);
    }
}

public record ReenviarVerificacionCommand(string Email, string UrlBase) : IRequest;

/// <summary>
/// Vuelve a mandar el enlace.
///
/// Responde igual exista o no la cuenta, y esté o no verificada: contestar
/// distinto convertiría esta ruta en una forma de averiguar qué correos están
/// registrados.
/// </summary>
public class ReenviarVerificacionCommandHandler(
    IUsuarioRepository repo,
    IServicioCorreo correo)
    : IRequestHandler<ReenviarVerificacionCommand>
{
    public async Task Handle(ReenviarVerificacionCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return;

        var usuario = await repo.ObtenerPorEmailAsync(request.Email.Trim(), ct);

        if (usuario is null || usuario.EmailVerificado || !usuario.Activo)
            return;

        _ = await VerificacionCorreo.PrepararYEnviarAsync(usuario, correo, request.UrlBase, ct);
        await repo.GuardarCambiosAsync(ct);
    }
}
