using MediatR;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Auth.Commands.Refresh;

public record RefreshCommand(string RefreshToken) : IRequest<LoginResponse>;

/// <summary>
/// Canjea un refresh token por un par nuevo de credenciales.
///
/// Sin esto el access token —que dura 15 minutos— no se podía renovar: la
/// sesión se cortaba a mitad de una consulta y el autoguardado del
/// constructor de dietas se perdía al recibir el 401.
///
/// Rota el token: el usado queda revocado y se entrega uno nuevo. Así, si
/// alguien roba un refresh token y lo usa, el legítimo deja de funcionar y el
/// robo se vuelve detectable en vez de silencioso.
/// </summary>
public class RefreshCommandHandler(
    IUsuarioRepository usuarioRepo,
    IJwtService jwtService)
    : IRequestHandler<RefreshCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(RefreshCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            throw new UnauthorizedAccessException("Sesión inválida.");

        var guardado = await usuarioRepo.ObtenerRefreshTokenAsync(request.RefreshToken, ct)
            ?? throw new UnauthorizedAccessException("Sesión inválida.");

        // Un mismo mensaje para token inexistente, revocado o vencido: decir
        // cuál de los tres es le daría información a quien esté probando.
        if (guardado.Revocado || guardado.Expira <= DateTime.UtcNow)
            throw new UnauthorizedAccessException("Sesión inválida.");

        var usuario = await usuarioRepo.ObtenerPorIdAsync(guardado.UsuarioId, ct)
            ?? throw new UnauthorizedAccessException("Sesión inválida.");

        if (!usuario.Activo)
            throw new UnauthorizedAccessException("Usuario inactivo.");

        guardado.Revocado = true;

        var accessToken = jwtService.GenerarAccessToken(usuario);
        var refreshToken = jwtService.GenerarRefreshToken();

        await usuarioRepo.AgregarRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuario.Id,
            Token = refreshToken,
            Expira = DateTime.UtcNow.AddDays(7),
        }, ct);

        await usuarioRepo.GuardarCambiosAsync(ct);

        var nombreCompleto = usuario.Nutricionista is not null
            ? $"{usuario.Nutricionista.Nombres} {usuario.Nutricionista.Apellidos}"
            : usuario.Paciente is not null
                ? $"{usuario.Paciente.Nombres} {usuario.Paciente.Apellidos}"
                : usuario.Email;

        return RespuestaSesion.Crear(usuario, accessToken, refreshToken, nombreCompleto);
    }
}
