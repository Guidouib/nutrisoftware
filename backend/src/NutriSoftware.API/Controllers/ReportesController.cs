using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.DTOs.Reportes;
using NutriSoftware.Application.Features.Reportes;
using System.Security.Claims;

namespace NutriSoftware.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportesController(IMediator mediator) : ControllerBase
{
    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<PdfGeneradoDto>), 200)]
    public async Task<ActionResult<List<PdfGeneradoDto>>> Listar(
        [FromQuery] Guid pacienteId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetReportesQuery(pacienteId, GetNutricionistaId()), ct);
        return Ok(result);
    }

    /// <summary>Compone el plan nutricional con QuestPDF y lo archiva en el expediente.</summary>
    [HttpPost("dieta")]
    [ProducesResponseType(typeof(PdfGeneradoDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PdfGeneradoDto>> GenerarDeDieta(
        [FromBody] GenerarPdfRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new GenerarPdfDietaCommand(GetNutricionistaId(), request), ct);
        return CreatedAtAction(nameof(Descargar), new { id = result.Id }, result);
    }

    /// <summary>
    /// Devuelve el binario. Requiere el token de sesión, así que el frontend lo
    /// pide con axios y arma un blob local en vez de usar un enlace directo.
    /// </summary>
    [HttpGet("{id:guid}/descargar")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Descargar(Guid id, CancellationToken ct)
    {
        var (contenido, nombreArchivo) = await mediator.Send(
            new DescargarReporteQuery(id, GetNutricionistaId()), ct);

        return File(contenido, "application/pdf", nombreArchivo);
    }

    /// <summary>
    /// Envío del reporte por correo al paciente. Aún no implementado: el
    /// proyecto no tiene proveedor de email configurado.
    /// </summary>
    [HttpPost("{id:guid}/enviar")]
    [ProducesResponseType(501)]
    public IActionResult EnviarPorEmail(Guid id)
    {
        _ = id;
        return StatusCode(StatusCodes.Status501NotImplemented, new
        {
            error = "El envío por email todavía no está disponible: falta configurar el proveedor de correo."
        });
    }
}
