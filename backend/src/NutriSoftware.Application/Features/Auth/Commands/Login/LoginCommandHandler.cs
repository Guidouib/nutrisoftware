using MediatR;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler(IUsuarioRepository usuarioRepo, IJwtService jwtService, IPasswordService passwordService)
    : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await usuarioRepo.ObtenerPorEmailAsync(request.Email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Credenciales inválidas.");

        if (!passwordService.VerifyPassword(request.Password, usuario.PasswordHash))
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        if (!usuario.Activo)
            throw new UnauthorizedAccessException("Usuario inactivo.");

        var accessToken = jwtService.GenerarAccessToken(usuario);
        var refreshToken = jwtService.GenerarRefreshToken();

        await usuarioRepo.AgregarRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuario.Id,
            Token = refreshToken,
            Expira = DateTime.UtcNow.AddDays(7)
        }, cancellationToken);

        await usuarioRepo.GuardarCambiosAsync(cancellationToken);

        var nombreCompleto = usuario.Nutricionista is not null
            ? $"{usuario.Nutricionista.Nombres} {usuario.Nutricionista.Apellidos}"
            : usuario.Paciente is not null
                ? $"{usuario.Paciente.Nombres} {usuario.Paciente.Apellidos}"
                : usuario.Email;

        return new LoginResponse(accessToken, refreshToken, usuario.Email, nombreCompleto, usuario.Rol.ToString());
    }
}
