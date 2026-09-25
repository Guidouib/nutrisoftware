using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Application.Features.Auth.Commands.Login;
using NutriSoftware.Application.Features.Auth.Commands.Refresh;
using NutriSoftware.Application.Features.Auth.Commands.Register;
using NutriSoftware.Application.Features.Auth.Commands.Verificar;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("Autenticacion")]
public class AuthController(IMediator mediator, IConfiguration config) : ControllerBase
{
    /// <summary>
    /// Con <c>PermitirRegistroPublico=false</c> el alta queda cerrada y las
    /// cuentas las crea el administrador.
    ///
    /// Por defecto sigue abierta para no cambiar el comportamiento actual,
    /// pero conviene cerrarla en una instancia con pacientes reales: sin esto
    /// cualquiera se crea una cuenta en la misma base.
    /// </summary>
    private bool RegistroAbierto => config.GetValue("PermitirRegistroPublico", true);

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(request.Email, request.Password), ct);
        return Ok(result);
    }

    /// <summary>
    /// Origen desde el que llega la peticion, para armar el enlace de
    /// verificacion. Se toma la cabecera Origin y no la URL del API: el
    /// enlace tiene que llevar al frontend, que vive en otro dominio.
    /// </summary>
    private string UrlBaseFrontend =>
        Request.Headers.Origin.FirstOrDefault()
        ?? config["AllowedOrigins"]?.Split(',')[0].Trim()
        ?? "http://localhost:5173";

    [HttpPost("register")]
    [ProducesResponseType(typeof(RegistroResponse), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<RegistroResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        if (!RegistroAbierto)
            throw new InvalidOperationException(
                "El registro está cerrado. Pedí una cuenta al administrador.");

        var result = await mediator.Send(
            new RegisterCommand(request.Email, request.Password, request.Nombres,
                request.Apellidos, request.Especialidad, request.Telefono, UrlBaseFrontend),
            ct);
        return CreatedAtAction(nameof(Login), result);
    }

    /// <summary>Canjea el token del enlace que llega por correo.</summary>
    [HttpPost("verificar")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Verificar([FromBody] VerificarRequest request, CancellationToken ct)
    {
        await mediator.Send(new VerificarCorreoCommand(request.Token), ct);
        return NoContent();
    }

    /// <summary>
    /// Reenvia el enlace de verificacion.
    ///
    /// Responde 204 siempre, exista o no la cuenta: contestar distinto
    /// convertiria esta ruta en una forma de averiguar que correos estan
    /// registrados.
    /// </summary>
    [HttpPost("reenviar-verificacion")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> ReenviarVerificacion(
        [FromBody] ReenviarVerificacionRequest request, CancellationToken ct)
    {
        await mediator.Send(new ReenviarVerificacionCommand(request.Email, UrlBaseFrontend), ct);
        return NoContent();
    }

    /// <summary>
    /// Canjea un refresh token por credenciales nuevas.
    ///
    /// El access token dura 15 minutos; sin esta ruta la sesión se corta a
    /// mitad de una consulta. El token usado queda revocado y se entrega uno
    /// nuevo, así un token robado deja de servir apenas el legítimo renueva.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoginResponse>> Refresh(
        [FromBody] RefreshRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new RefreshCommand(request.RefreshToken), ct);
        return Ok(result);
    }
}
