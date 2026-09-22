using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Seguimiento;
using NutriSoftware.Application.Features.Seguimiento;
using System.Security.Claims;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SeguimientoController(IMediator mediator) : ControllerBase
{
    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<SeguimientoDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<SeguimientoDto>>> Listar(
        [FromQuery] Guid pacienteId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetSeguimientosQuery(pacienteId, GetNutricionistaId()), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SeguimientoDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SeguimientoDto>> Crear(
        [FromBody] CrearSeguimientoRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CrearSeguimientoCommand(GetNutricionistaId(), request), ct);
        return CreatedAtAction(nameof(Listar), new { pacienteId = result.PacienteId }, result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new EliminarSeguimientoCommand(id, GetNutricionistaId()), ct);
        return NoContent();
    }
}
