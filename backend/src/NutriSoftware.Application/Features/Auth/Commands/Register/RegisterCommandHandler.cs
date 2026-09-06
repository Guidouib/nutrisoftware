using MediatR;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler(IUsuarioRepository usuarioRepo, IJwtService jwtService, IPasswordService passwordService)
    : IRequestHandler<RegisterCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await usuarioRepo.ExisteEmailAsync(request.Email, cancellationToken))
            throw new InvalidOperationException("El email ya está registrado.");

        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = passwordService.HashPassword(request.Password),
            Rol = RolUsuario.Nutricionista
        };

        usuario.Nutricionista = new Nutricionista
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuario.Id,
            Nombres = request.Nombres,
            Apellidos = request.Apellidos,
            Especialidad = request.Especialidad,
            Telefono = request.Telefono
        };

        await usuarioRepo.AgregarAsync(usuario, cancellationToken);

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

        return new LoginResponse(
            accessToken,
            refreshToken,
            usuario.Email,
            $"{request.Nombres} {request.Apellidos}",
            usuario.Rol.ToString()
        );
    }
}
