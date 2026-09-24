using System.Reflection;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Infrastructure.Data;

/// <summary>Fila del recurso de siembra <c>tpca-alimentos.json</c>.</summary>
internal record FilaTpca(
    string Codigo,
    string Nombre,
    string Categoria,
    string Origen,
    decimal Energia,
    decimal Proteinas,
    decimal Grasas,
    decimal Carbohidratos,
    decimal Fibra,
    Dictionary<string, decimal?> Micro
);

/// <summary>
/// Carga la tabla peruana de composición de alimentos (1.870 entradas con
/// hasta 22 nutrientes) desde un recurso embebido.
///
/// Los 28 alimentos de siembra que ya tenía NutriSoftware se conservan: esto
/// agrega, no reemplaza. La importación es idempotente —se saltea lo que ya
/// esté cargado por nombre— así que correrla de nuevo no duplica nada.
/// </summary>
public static class ImportadorTablaTpca
{
    private const string Recurso = "NutriSoftware.Infrastructure.Data.Seed.tpca-alimentos.json";

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static async Task ImportarAsync(ApplicationDbContext db, CancellationToken ct = default)
    {
        var filas = LeerRecurso();
        if (filas.Count == 0)
            return;

        // Una sola consulta para saber qué falta: comparar de a uno contra la
        // base serían 1.870 viajes.
        var existentes = await db.Alimentos
            .Where(a => !a.EsPersonalizado)
            .Select(a => a.Nombre)
            .ToListAsync(ct);

        var yaEstan = new HashSet<string>(existentes, StringComparer.OrdinalIgnoreCase);

        var nuevos = new List<Alimento>();
        foreach (var fila in filas)
        {
            var nombre = fila.Nombre.Trim();
            // El Excel de origen repite nombres (varias preparaciones del
            // mismo plato); nos quedamos con la primera aparición.
            if (string.IsNullOrWhiteSpace(nombre) || !yaEstan.Add(nombre))
                continue;

            nuevos.Add(new Alimento
            {
                Id = Guid.NewGuid(),
                Nombre = nombre,
                Fuente = FuenteAlimento.TPCA,
                Categoria = fila.Categoria,
                Energia = fila.Energia,
                Proteinas = fila.Proteinas,
                Grasas = fila.Grasas,
                Carbohidratos = fila.Carbohidratos,
                Fibra = fila.Fibra,
                MicronutrientesJson = JsonSerializer.Serialize(fila.Micro, Json),
                EsPersonalizado = false,
                FechaCreacion = DateTime.UtcNow,
            });
        }

        if (nuevos.Count == 0)
            return;

        await db.Alimentos.AddRangeAsync(nuevos, ct);
        await db.SaveChangesAsync(ct);
    }

    private static List<FilaTpca> LeerRecurso()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(Recurso);
        if (stream is null)
            return [];

        return JsonSerializer.Deserialize<List<FilaTpca>>(stream, Json) ?? [];
    }
}
