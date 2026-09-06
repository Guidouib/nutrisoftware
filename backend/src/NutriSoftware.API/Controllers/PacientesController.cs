using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Pacientes;
using NutriSoftware.Application.Features.Pacientes;
using System.Security.Claims;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PacientesController(IMediator mediator) : ControllerBase
{
    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<PacienteDto>), 200)]
    public async Task<ActionResult<List<PacienteDto>>> Listar(
        [FromQuery] string? busqueda,
        [FromQuery] bool? activo,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetPacientesQuery(GetNutricionistaId(), busqueda, activo), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PacienteDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PacienteDto>> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetPacienteByIdQuery(id, GetNutricionistaId()), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PacienteDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<PacienteDto>> Crear([FromBody] CrearPacienteRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CrearPacienteCommand(GetNutricionistaId(), request), ct);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(PacienteDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PacienteDto>> Actualizar(
        Guid id, [FromBody] ActualizarPacienteRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new ActualizarPacienteCommand(id, GetNutricionistaId(), request), ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(typeof(PacienteDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PacienteDto>> ToggleEstado(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new ToggleEstadoPacienteCommand(id, GetNutricionistaId()), ct);
        return Ok(result);
    }
}
