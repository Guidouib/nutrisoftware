using MediatR;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Auth;
using NutriSoftware.Application.Features.Auth.Commands.Login;
using NutriSoftware.Application.Features.Auth.Commands.Register;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
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
        var result = await mediator.Send(
            new RegisterCommand(request.Email, request.Password, request.Nombres, request.Apellidos, request.Especialidad, request.Telefono),
            ct);
        return CreatedAtAction(nameof(Login), result);
    }
}
