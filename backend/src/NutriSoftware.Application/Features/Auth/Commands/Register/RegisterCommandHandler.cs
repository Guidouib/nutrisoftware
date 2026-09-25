using MediatR;
using NutriSoftware.Application.Common;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Application.Features.Auth;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler(
    IUsuarioRepository usuarioRepo,
    IJwtService jwtService,
    IPasswordService passwordService,
    IServicioCorreo correo)
    : IRequestHandler<RegisterCommand, RegistroResponse>
{
    public async Task<RegistroResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            throw new InvalidOperationException("El correo no es válido.");

        // La validación del navegador es comodidad, no control: sin esto el
        // API acepta cualquier contraseña, incluida una de un carácter.
        var motivo = PoliticaContrasena.Validar(request.Password);
        if (motivo is not null)
            throw new InvalidOperationException(motivo);

        if (string.IsNullOrWhiteSpace(request.Nombres) || string.IsNullOrWhiteSpace(request.Apellidos))
            throw new InvalidOperationException("Nombres y apellidos son obligatorios.");

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

        // Marca la cuenta como pendiente y manda el enlace. Si no hay SMTP
        // configurado la da por verificada: sin correo el alta no se podria
        // completar nunca y la cuenta quedaria inaccesible.
        var enviado = await VerificacionCorreo.PrepararYEnviarAsync(
            usuario, correo, request.UrlBase, cancellationToken);

        if (!usuario.EmailVerificado)
        {
            await usuarioRepo.GuardarCambiosAsync(cancellationToken);

            // La cuenta queda creada aunque el correo no haya salido: se avisa
            // con franqueza y el usuario puede pedir el enlace de nuevo.
            return new RegistroResponse(
                RequiereVerificacion: true,
                Mensaje: enviado
                    ? $"Te enviamos un correo a {usuario.Email}. Abri el enlace para activar tu cuenta."
                    : "Tu cuenta fue creada, pero no pudimos enviarte el correo de " +
                      "confirmacion. Pedi un enlace nuevo desde el login.",
                Sesion: null);
        }

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

        return new RegistroResponse(
            RequiereVerificacion: false,
            Mensaje: "Cuenta creada.",
            Sesion: new LoginResponse(
                accessToken,
                refreshToken,
                usuario.Email,
                $"{request.Nombres} {request.Apellidos}",
                usuario.Rol.ToString()));
    }
}
