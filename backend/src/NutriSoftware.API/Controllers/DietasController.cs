using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Dietas;
using NutriSoftware.Application.Features.Dietas;
using System.Security.Claims;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DietasController(IMediator mediator) : ControllerBase
{
    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<DietaDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<DietaDto>>> Listar([FromQuery] Guid pacienteId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetDietasQuery(pacienteId, GetNutricionistaId()), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DietaDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DietaDto>> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetDietaByIdQuery(id, GetNutricionistaId()), ct);
        return Ok(result);
    }

    /// <summary>
    /// Crea o reemplaza el plan con el id indicado. Es idempotente a propósito:
    /// el constructor del frontend genera el id al abrir la dieta nueva y
    /// autoguarda el plan completo cada 2 segundos sobre esa misma ruta.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(DietaDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DietaDto>> Guardar(
        Guid id, [FromBody] GuardarDietaRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new GuardarDietaCommand(id, GetNutricionistaId(), request), ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new EliminarDietaCommand(id, GetNutricionistaId()), ct);
        return NoContent();
    }
}
