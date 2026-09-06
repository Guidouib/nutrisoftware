using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Citas;
using NutriSoftware.Application.Features.Citas;
using System.Security.Claims;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CitasController(IMediator mediator) : ControllerBase
{
    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<CitaDto>), 200)]
    public async Task<ActionResult<List<CitaDto>>> Listar(
        [FromQuery] int? mes,
        [FromQuery] int? anio,
        [FromQuery] Guid? pacienteId,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetCitasQuery(GetNutricionistaId(), mes, anio, pacienteId), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CitaDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<CitaDto>> Crear([FromBody] CrearCitaRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CrearCitaCommand(GetNutricionistaId(), request), ct);
        return StatusCode(201, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CitaDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CitaDto>> Actualizar(
        Guid id, [FromBody] ActualizarCitaRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new ActualizarCitaCommand(id, GetNutricionistaId(), request), ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(typeof(CitaDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CitaDto>> CambiarEstado(
        Guid id, [FromBody] CambiarEstadoRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CambiarEstadoCitaCommand(id, GetNutricionistaId(), request.Estado), ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new EliminarCitaCommand(id, GetNutricionistaId()), ct);
        return NoContent();
    }
}
