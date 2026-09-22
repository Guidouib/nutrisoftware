using System.Text.Json.Nodes;
using MediatR;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Evaluaciones;

/* ═══════════════════════════════════════════════════════════════
   Las siete evaluaciones comparten estructura: id, paciente, fecha
   y un bloque de mediciones propio del sub-módulo. Ese bloque viaja
   como JSON (ver Evaluacion.DatosJson), así que los handlers
   trabajan con JsonObject y devuelven el objeto plano que espera el
   frontend: los campos comunes mezclados con los del sub-módulo.
   ═══════════════════════════════════════════════════════════════ */

internal static class EvaluacionMapper
{
    /// <summary>Campos que son columnas propias y no deben duplicarse en DatosJson.</summary>
    private static readonly string[] Comunes = ["id", "pacienteId", "fecha"];

    /// <summary>Entidad → objeto plano con los datos del sub-módulo al mismo nivel.</summary>
    internal static JsonObject ToDto(Evaluacion e)
    {
        var dto = JsonNode.Parse(e.DatosJson) as JsonObject ?? [];

        dto["id"] = e.Id.ToString();
        dto["pacienteId"] = e.PacienteId.ToString();
        dto["fecha"] = e.Fecha.ToString("yyyy-MM-dd");

        return dto;
    }

    /// <summary>Cuerpo de la petición → JSON a persistir, sin los campos comunes.</summary>
    internal static string ExtraerDatos(JsonObject cuerpo)
    {
        var datos = JsonNode.Parse(cuerpo.ToJsonString()) as JsonObject ?? [];
        foreach (var campo in Comunes) datos.Remove(campo);
        return datos.ToJsonString();
    }

    internal static DateOnly LeerFecha(JsonObject cuerpo)
    {
        var texto = cuerpo["fecha"]?.GetValue<string>();
        return DateOnly.TryParse(texto, out var fecha)
            ? fecha
            : DateOnly.FromDateTime(DateTime.UtcNow);
    }

    /// <summary>Texto plano de un campo, si viene y no está vacío.</summary>
    internal static string? LeerTexto(JsonObject cuerpo, string campo)
    {
        var valor = cuerpo[campo]?.GetValue<string>()?.Trim();
        return string.IsNullOrEmpty(valor) ? null : valor;
    }
}

/* ── Consultas ─────────────────────────────────────────────────── */

public record GetEvaluacionesQuery(Guid PacienteId, Guid NutricionistaId, TipoEvaluacion Tipo)
    : IRequest<List<JsonObject>>;

public class GetEvaluacionesQueryHandler(IEvaluacionRepository repo)
    : IRequestHandler<GetEvaluacionesQuery, List<JsonObject>>
{
    public async Task<List<JsonObject>> Handle(GetEvaluacionesQuery request, CancellationToken ct)
    {
        if (!await repo.PacientePerteneceAsync(request.PacienteId, request.NutricionistaId, ct))
            throw new KeyNotFoundException("Paciente no encontrado.");

        var evaluaciones = await repo.ObtenerPorPacienteAsync(
            request.PacienteId, request.NutricionistaId, request.Tipo, ct);

        return evaluaciones.Select(EvaluacionMapper.ToDto).ToList();
    }
}

public record GetEvaluacionByIdQuery(Guid Id, Guid NutricionistaId) : IRequest<JsonObject>;

public class GetEvaluacionByIdQueryHandler(IEvaluacionRepository repo)
    : IRequestHandler<GetEvaluacionByIdQuery, JsonObject>
{
    public async Task<JsonObject> Handle(GetEvaluacionByIdQuery request, CancellationToken ct)
    {
        var evaluacion = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Evaluación no encontrada.");
        return EvaluacionMapper.ToDto(evaluacion);
    }
}

/* ── Comandos ──────────────────────────────────────────────────── */

public record CrearEvaluacionCommand(Guid NutricionistaId, TipoEvaluacion Tipo, JsonObject Cuerpo)
    : IRequest<JsonObject>;

public class CrearEvaluacionCommandHandler(IEvaluacionRepository repo)
    : IRequestHandler<CrearEvaluacionCommand, JsonObject>
{
    public async Task<JsonObject> Handle(CrearEvaluacionCommand request, CancellationToken ct)
    {
        var pacienteId = LeerPacienteId(request.Cuerpo);

        if (!await repo.PacientePerteneceAsync(pacienteId, request.NutricionistaId, ct))
            throw new KeyNotFoundException("Paciente no encontrado.");

        var ahora = DateTime.UtcNow;
        var evaluacion = new Evaluacion
        {
            Id                 = Guid.NewGuid(),
            PacienteId         = pacienteId,
            Tipo               = request.Tipo,
            Fecha              = EvaluacionMapper.LeerFecha(request.Cuerpo),
            DatosJson          = EvaluacionMapper.ExtraerDatos(request.Cuerpo),
            Diagnostico        = EvaluacionMapper.LeerTexto(request.Cuerpo, "diagnostico"),
            Prescripcion       = EvaluacionMapper.LeerTexto(request.Cuerpo, "prescripcion"),
            FechaCreacion      = ahora,
            FechaActualizacion = ahora,
        };

        await repo.AgregarAsync(evaluacion, ct);
        await repo.GuardarCambiosAsync(ct);

        return EvaluacionMapper.ToDto(evaluacion);
    }

    internal static Guid LeerPacienteId(JsonObject cuerpo)
    {
        var texto = cuerpo["pacienteId"]?.GetValue<string>();
        return Guid.TryParse(texto, out var id)
            ? id
            : throw new InvalidOperationException("Falta el identificador del paciente.");
    }
}

public record ActualizarEvaluacionCommand(Guid Id, Guid NutricionistaId, TipoEvaluacion Tipo, JsonObject Cuerpo)
    : IRequest<JsonObject>;

public class ActualizarEvaluacionCommandHandler(IEvaluacionRepository repo)
    : IRequestHandler<ActualizarEvaluacionCommand, JsonObject>
{
    public async Task<JsonObject> Handle(ActualizarEvaluacionCommand request, CancellationToken ct)
    {
        var evaluacion = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Evaluación no encontrada.");

        if (evaluacion.Tipo != request.Tipo)
            throw new InvalidOperationException("La evaluación no corresponde a este tipo.");

        evaluacion.Fecha              = EvaluacionMapper.LeerFecha(request.Cuerpo);
        evaluacion.DatosJson          = EvaluacionMapper.ExtraerDatos(request.Cuerpo);
        evaluacion.Diagnostico        = EvaluacionMapper.LeerTexto(request.Cuerpo, "diagnostico");
        evaluacion.Prescripcion       = EvaluacionMapper.LeerTexto(request.Cuerpo, "prescripcion");
        evaluacion.FechaActualizacion = DateTime.UtcNow;

        await repo.GuardarCambiosAsync(ct);

        return EvaluacionMapper.ToDto(evaluacion);
    }
}

public record EliminarEvaluacionCommand(Guid Id, Guid NutricionistaId) : IRequest<Unit>;

public class EliminarEvaluacionCommandHandler(IEvaluacionRepository repo)
    : IRequestHandler<EliminarEvaluacionCommand, Unit>
{
    public async Task<Unit> Handle(EliminarEvaluacionCommand request, CancellationToken ct)
    {
        var evaluacion = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Evaluación no encontrada.");

        repo.Eliminar(evaluacion);
        await repo.GuardarCambiosAsync(ct);

        return Unit.Value;
    }
}
