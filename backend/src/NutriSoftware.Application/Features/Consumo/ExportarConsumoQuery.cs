using System.Globalization;
using System.Text;
using MediatR;
using NutriSoftware.Domain;
using NutriSoftware.Domain.Interfaces;

namespace NutriSoftware.Application.Features.Consumo;

/// <summary>
/// Exporta todos los recordatorios de un paciente como CSV plano, una fila
/// por alimento declarado.
///
/// Es el equivalente de la hoja <c>BDProteinas</c> del Excel, que era lo que
/// realmente se llevaba a analizar. NutriSoftware solo sabía exportar PDF, y
/// un PDF no se abre en SPSS ni en R.
/// </summary>
public record ExportarConsumoQuery(Guid PacienteId, Guid NutricionistaId) : IRequest<string>;

public class ExportarConsumoQueryHandler(IConsumoRepository repo)
    : IRequestHandler<ExportarConsumoQuery, string>
{
    public async Task<string> Handle(ExportarConsumoQuery request, CancellationToken ct)
    {
        if (!await repo.PacientePerteneceAsync(request.PacienteId, request.NutricionistaId, ct))
            throw new KeyNotFoundException("Paciente no encontrado.");

        var items = await repo.ObtenerItemsDelPacienteAsync(
            request.PacienteId, request.NutricionistaId, ct);

        var sb = new StringBuilder();

        var cabecera = new List<string>
        {
            "registro_id", "fecha", "titulo", "tiempo_comida", "orden",
            "alimento", "origen", "gramos",
        };
        cabecera.AddRange(Nutrientes.Todos.Select(n => $"{n.Clave}_{n.Unidad}"));
        sb.AppendLine(string.Join(",", cabecera.Select(Escapar)));

        foreach (var item in items)
        {
            var dto = ConsumoMapper.ToDto(item);
            var fila = new List<string>
            {
                item.RegistroConsumoId.ToString(),
                item.RegistroConsumo.Fecha.ToString("yyyy-MM-dd"),
                item.RegistroConsumo.Titulo,
                item.TiempoComida,
                item.Orden.ToString(CultureInfo.InvariantCulture),
                item.NombreAlimento,
                item.OrigenAlimento,
                item.Gramos.ToString(CultureInfo.InvariantCulture),
            };

            // Celda vacía cuando la tabla no tiene el dato. Un cero diría que
            // el alimento no aporta ese nutriente, que es una afirmación
            // distinta y falsa.
            fila.AddRange(Nutrientes.Todos.Select(n =>
                dto.Aporte.TryGetValue(n.Clave, out var v) && v.HasValue
                    ? v.Value.ToString(CultureInfo.InvariantCulture)
                    : string.Empty));

            sb.AppendLine(string.Join(",", fila.Select(Escapar)));
        }

        return sb.ToString();
    }

    private static string Escapar(string campo)
    {
        if (!campo.Contains(',') && !campo.Contains('"') && !campo.Contains('\n'))
            return campo;

        return '"' + campo.Replace("\"", "\"\"") + '"';
    }
}
