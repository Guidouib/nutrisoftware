using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Application.Features.Auth.Commands.Login;
using NutriSoftware.Application.Features.Auth.Commands.Refresh;
using NutriSoftware.Application.Features.Auth.Commands.Register;

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

    [HttpPost("register")]
    [ProducesResponseType(typeof(LoginResponse), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        if (!RegistroAbierto)
            throw new InvalidOperationException(
                "El registro está cerrado. Pedí una cuenta al administrador.");

        var result = await mediator.Send(
            new RegisterCommand(request.Email, request.Password, request.Nombres, request.Apellidos, request.Especialidad, request.Telefono),
            ct);
        return CreatedAtAction(nameof(Login), result);
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
