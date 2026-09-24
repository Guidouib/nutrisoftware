using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Consumo;
using NutriSoftware.Application.Features.Consumo;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConsumoController(IMediator mediator) : ControllerBase
{
    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<RegistroConsumoResumenDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<RegistroConsumoResumenDto>>> Listar(
        [FromQuery] Guid pacienteId, CancellationToken ct)
    {
        var result = await mediator.Send(new ListarConsumoQuery(pacienteId, GetNutricionistaId()), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RegistroConsumoDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<RegistroConsumoDto>> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new ObtenerConsumoQuery(id, GetNutricionistaId()), ct);
        return Ok(result);
    }

    /// <summary>
    /// Crea o reemplaza el recordatorio con el id indicado. Idempotente: la
    /// pantalla genera el id al abrir el recordatorio nuevo y autoguarda el
    /// contenido completo sobre esta misma ruta.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(RegistroConsumoDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<RegistroConsumoDto>> Guardar(
        Guid id, [FromBody] GuardarRegistroConsumoRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(
            new GuardarConsumoCommand(id, request, GetNutricionistaId()), ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new EliminarConsumoCommand(id, GetNutricionistaId()), ct);
        return NoContent();
    }

    /// <summary>
    /// CSV plano con una fila por alimento declarado, listo para SPSS o R.
    /// Exige el token como el resto, así que el frontend lo pide con axios y
    /// arma un object URL: un <c>&lt;a href download&gt;</c> no autentica.
    /// </summary>
    [HttpGet("exportar")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Exportar([FromQuery] Guid pacienteId, CancellationToken ct)
    {
        var csv = await mediator.Send(new ExportarConsumoQuery(pacienteId, GetNutricionistaId()), ct);

        // BOM para que Excel abra el CSV en UTF-8 y no rompa los acentos.
        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(bytes, "text/csv", $"consumo-{pacienteId}.csv");
    }
}
