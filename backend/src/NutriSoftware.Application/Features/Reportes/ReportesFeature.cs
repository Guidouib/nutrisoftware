using System.Text;
using System.Globalization;
using MediatR;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Application.DTOs.Dietas;
using NutriSoftware.Application.DTOs.Reportes;
using NutriSoftware.Application.Features.Dietas;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Reportes;

internal static class ReporteMapper
{
    internal static PdfGeneradoDto ToDto(PdfGenerado p) => new(
        p.Id,
        p.PacienteId,
        p.DietaId,
        p.Tipo,
        p.Fecha,
        p.TamanioBytes,
        $"/api/reportes/{p.Id}/descargar",
        "listo"
    );

    internal static int CalcularEdad(DateOnly nacimiento)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var edad = hoy.Year - nacimiento.Year;
        if (nacimiento > hoy.AddYears(-edad)) edad--;
        return Math.Max(0, edad);
    }

    /// <summary>Suma los gramos de cada alimento a lo largo de los siete días.</summary>
    internal static List<ItemCompraDto> ArmarListaCompras(DietaDto dieta)
    {
        var acumulado = new Dictionary<Guid, (string Nombre, string Fuente, decimal Gramos)>();

        foreach (var alimento in dieta.Dias.SelectMany(d => d.Tiempos).SelectMany(t => t.Alimentos))
        {
            var previo = acumulado.TryGetValue(alimento.AlimentoId, out var v) ? v.Gramos : 0;
            acumulado[alimento.AlimentoId] = (alimento.Nombre, alimento.Fuente, previo + alimento.Gramos);
        }

        return acumulado.Values
            .Select(v => new ItemCompraDto(v.Nombre, v.Fuente, Math.Round(v.Gramos, 1)))
            .OrderBy(i => i.Nombre, StringComparer.CurrentCultureIgnoreCase)
            .ToList();
    }
}

/* ── Consultas ─────────────────────────────────────────────────── */

public record GetReportesQuery(Guid PacienteId, Guid NutricionistaId) : IRequest<List<PdfGeneradoDto>>;

public class GetReportesQueryHandler(IReporteRepository repo)
    : IRequestHandler<GetReportesQuery, List<PdfGeneradoDto>>
{
    public async Task<List<PdfGeneradoDto>> Handle(GetReportesQuery request, CancellationToken ct)
    {
        var reportes = await repo.ObtenerPorPacienteAsync(request.PacienteId, request.NutricionistaId, ct);
        return reportes.Select(ReporteMapper.ToDto).ToList();
    }
}

public record DescargarReporteQuery(Guid Id, Guid NutricionistaId) : IRequest<(byte[] Contenido, string NombreArchivo)>;

public class DescargarReporteQueryHandler(IReporteRepository repo)
    : IRequestHandler<DescargarReporteQuery, (byte[], string)>
{
    public async Task<(byte[], string)> Handle(DescargarReporteQuery request, CancellationToken ct)
    {
        var reporte = await repo.ObtenerPorIdAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Reporte no encontrado.");

        var contenido = await repo.ObtenerContenidoAsync(request.Id, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("El archivo del reporte no está disponible.");

        return (contenido, reporte.NombreArchivo);
    }
}

/* ── Generación ────────────────────────────────────────────────── */

public record GenerarPdfDietaCommand(Guid NutricionistaId, GenerarPdfRequest Data) : IRequest<PdfGeneradoDto>;

public class GenerarPdfDietaCommandHandler(
    IDietaRepository dietas,
    IPacienteRepository pacientes,
    IReporteRepository reportes,
    IGeneradorPdf generador)
    : IRequestHandler<GenerarPdfDietaCommand, PdfGeneradoDto>
{
    public async Task<PdfGeneradoDto> Handle(GenerarPdfDietaCommand request, CancellationToken ct)
    {
        var d = request.Data;

        var dieta = await dietas.ObtenerPorIdAsync(d.DietaId, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Dieta no encontrada.");

        var paciente = await pacientes.ObtenerPorIdAsync(d.PacienteId, request.NutricionistaId, ct)
            ?? throw new KeyNotFoundException("Paciente no encontrado.");

        if (dieta.PacienteId != paciente.Id)
            throw new InvalidOperationException("La dieta no pertenece a ese paciente.");

        var dietaDto = DietaMapper.ToDto(dieta);

        var contenido = generador.GenerarPlanNutricional(new DatosPlanNutricional(
            new PacienteReporteDto(
                $"{paciente.Nombres} {paciente.Apellidos}",
                ReporteMapper.CalcularEdad(paciente.FechaNacimiento),
                paciente.Sexo,
                paciente.Dni),
            dietaDto,
            ReporteMapper.ArmarListaCompras(dietaDto),
            d.Configuracion));

        var titulo = string.IsNullOrWhiteSpace(d.Configuracion.Titulo)
            ? "Plan Nutricional"
            : d.Configuracion.Titulo.Trim();

        var reporte = new PdfGenerado
        {
            Id            = Guid.NewGuid(),
            PacienteId    = paciente.Id,
            DietaId       = dieta.Id,
            Tipo          = titulo,
            NombreArchivo = ArmarNombreArchivo(titulo, paciente.Apellidos),
            Contenido     = contenido,
            TamanioBytes  = contenido.LongLength,
            Fecha         = DateTime.UtcNow,
        };

        await reportes.AgregarAsync(reporte, ct);
        await reportes.GuardarCambiosAsync(ct);

        return ReporteMapper.ToDto(reporte);
    }

    private static string ArmarNombreArchivo(string titulo, string apellidos)
    {
        var limpio = new string([.. $"{titulo}-{apellidos}"
            .Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            .Select(c => char.IsLetterOrDigit(c) ? c : '-')]);

        var compacto = string.Join('-', limpio.Split('-', StringSplitOptions.RemoveEmptyEntries));
        return $"{compacto}-{DateTime.UtcNow:yyyyMMdd}.pdf".ToLowerInvariant();
    }
}
