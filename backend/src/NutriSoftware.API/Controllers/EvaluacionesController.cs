using System.Text.Json.Nodes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriSoftware.Application.Features.Evaluaciones;
using NutriSoftware.Domain.Enums;
using System.Security.Claims;

namespace NutriSoftware.API.Controllers;

/// <summary>
/// Base común de los siete sub-módulos de evaluación.
///
/// El cuerpo viaja como objeto JSON libre: los campos comunes (paciente, fecha,
/// diagnóstico, prescripción) se guardan en columnas y el resto de mediciones
/// —pliegues ISAK, Z-scores OMS, valores de laboratorio, signos clínicos— en
/// <c>datos_json</c>, siguiendo el esquema del plan. Así el formulario de un
/// sub-módulo puede cambiar sin migrar la base.
/// </summary>
[ApiController]
[Authorize]
public abstract class EvaluacionBaseController(IMediator mediator) : ControllerBase
{
    protected abstract TipoEvaluacion Tipo { get; }

    private Guid GetNutricionistaId() =>
        Guid.Parse(User.FindFirstValue("nutricionista_id")
            ?? throw new UnauthorizedAccessException("Sesión inválida."));

    [HttpGet]
    [ProducesResponseType(typeof(List<object>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<JsonObject>>> Listar(
        [FromQuery] Guid pacienteId, CancellationToken ct)
    {
        var result = await mediator.Send(
            new GetEvaluacionesQuery(pacienteId, GetNutricionistaId(), Tipo), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<JsonObject>> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetEvaluacionByIdQuery(id, GetNutricionistaId()), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(object), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<JsonObject>> Crear([FromBody] JsonObject cuerpo, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CrearEvaluacionCommand(GetNutricionistaId(), Tipo, cuerpo), ct);

        var id = Guid.Parse(result["id"]!.GetValue<string>());
        return CreatedAtAction(nameof(ObtenerPorId), new { id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<JsonObject>> Actualizar(
        Guid id, [FromBody] JsonObject cuerpo, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ActualizarEvaluacionCommand(id, GetNutricionistaId(), Tipo, cuerpo), ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new EliminarEvaluacionCommand(id, GetNutricionistaId()), ct);
        return NoContent();
    }
}

/* ── Un controlador por sub-módulo ─────────────────────────────── */

[Route("api/antropometrias")]
public class AntropometriasController(IMediator m) : EvaluacionBaseController(m)
{
    protected override TipoEvaluacion Tipo => TipoEvaluacion.Antropometria;
}

[Route("api/evaluaciones-nino")]
public class EvaluacionesNinoController(IMediator m) : EvaluacionBaseController(m)
{
    protected override TipoEvaluacion Tipo => TipoEvaluacion.Nino;
}

[Route("api/evaluaciones-adolescente")]
public class EvaluacionesAdolescenteController(IMediator m) : EvaluacionBaseController(m)
{
    protected override TipoEvaluacion Tipo => TipoEvaluacion.Adolescente;
}

[Route("api/evaluaciones-embarazada")]
public class EvaluacionesEmbarazadaController(IMediator m) : EvaluacionBaseController(m)
{
    protected override TipoEvaluacion Tipo => TipoEvaluacion.Embarazada;
}

[Route("api/bioquimicas")]
public class BioquimicasController(IMediator m) : EvaluacionBaseController(m)
{
    protected override TipoEvaluacion Tipo => TipoEvaluacion.Bioquimica;
}

[Route("api/evaluaciones-clinica")]
public class EvaluacionesClinicaController(IMediator m) : EvaluacionBaseController(m)
{
    protected override TipoEvaluacion Tipo => TipoEvaluacion.Clinica;
}

[Route("api/evaluaciones-adulto")]
public class EvaluacionesAdultoController(IMediator m) : EvaluacionBaseController(m)
{
    protected override TipoEvaluacion Tipo => TipoEvaluacion.Adulto;
}
