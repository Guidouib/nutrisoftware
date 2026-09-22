using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class ReporteRepository(ApplicationDbContext db) : IReporteRepository
{
    private IQueryable<PdfGenerado> DelNutricionista(Guid nutricionistaId) =>
        db.PdfsGenerados.Where(p => p.Paciente.NutricionistaId == nutricionistaId);

    /// <summary>
    /// El listado proyecta sin <c>Contenido</c>: traer los binarios de todo el
    /// historial para pintar una tabla de metadatos sería malgastar memoria.
    /// </summary>
    public async Task<List<PdfGenerado>> ObtenerPorPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(p => p.PacienteId == pacienteId)
            .OrderByDescending(p => p.Fecha)
            .Select(p => new PdfGenerado
            {
                Id            = p.Id,
                PacienteId    = p.PacienteId,
                DietaId       = p.DietaId,
                Tipo          = p.Tipo,
                NombreArchivo = p.NombreArchivo,
                TamanioBytes  = p.TamanioBytes,
                Fecha         = p.Fecha,
            })
            .ToListAsync(ct);

    public async Task<PdfGenerado?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(p => p.Id == id)
            .Select(p => new PdfGenerado
            {
                Id            = p.Id,
                PacienteId    = p.PacienteId,
                DietaId       = p.DietaId,
                Tipo          = p.Tipo,
                NombreArchivo = p.NombreArchivo,
                TamanioBytes  = p.TamanioBytes,
                Fecha         = p.Fecha,
            })
            .FirstOrDefaultAsync(ct);

    public async Task<byte[]?> ObtenerContenidoAsync(Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(p => p.Id == id)
            .Select(p => p.Contenido)
            .FirstOrDefaultAsync(ct);

    public async Task AgregarAsync(PdfGenerado reporte, CancellationToken ct) =>
        await db.PdfsGenerados.AddAsync(reporte, ct);

    public async Task GuardarCambiosAsync(CancellationToken ct) => await db.SaveChangesAsync(ct);
}
