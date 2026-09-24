using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Alimentos;
using NutriSoftware.Application.Features.Alimentos;
using System.Security.Claims;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlimentosController(IMediator mediator) : ControllerBase
{
    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<AlimentoDto>), 200)]
    public async Task<ActionResult<List<AlimentoDto>>> Listar(
        [FromQuery] string? fuente,
        [FromQuery] string? categoria,
        [FromQuery] string? busqueda,
        CancellationToken ct)
    {
        var result = await mediator.Send(
            new GetAlimentosQuery(GetNutricionistaId(), fuente, categoria, busqueda), ct);
        return Ok(result);
    }

    /// <summary>
    /// Un alimento con su composición completa (hasta 22 nutrientes). El
    /// listado los omite para no mandar 1,2 MB; acá vienen.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AlimentoDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<AlimentoDto>> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAlimentoByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AlimentoDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<AlimentoDto>> Crear([FromBody] CrearAlimentoRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CrearAlimentoCommand(GetNutricionistaId(), request), ct);
        return StatusCode(201, result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new EliminarAlimentoCommand(id, GetNutricionistaId()), ct);
        return NoContent();
    }
}
