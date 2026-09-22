using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class DietaRepository(ApplicationDbContext db) : IDietaRepository
{
    private IQueryable<Dieta> DelNutricionista(Guid nutricionistaId) =>
        db.Dietas.Where(d => d.Paciente.NutricionistaId == nutricionistaId);

    public async Task<List<Dieta>> ObtenerPorPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(d => d.PacienteId == pacienteId)
            .Include(d => d.Dias)
                .ThenInclude(dia => dia.TiemposComida)
            .OrderByDescending(d => d.Fecha)
            .ThenByDescending(d => d.FechaCreacion)
            .ToListAsync(ct);

    public async Task<Dieta?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Include(d => d.Dias)
                .ThenInclude(dia => dia.TiemposComida)
            .FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task AgregarAsync(Dieta dieta, CancellationToken ct) =>
        await db.Dietas.AddAsync(dieta, ct);

    public void Eliminar(Dieta dieta) => db.Dietas.Remove(dieta);

    public void EliminarTiempos(IEnumerable<TiempoComida> tiempos) =>
        db.TiemposComida.RemoveRange(tiempos);

    /// <summary>
    /// Solo se borra el día: la FK está en cascada, así que Postgres se lleva
    /// sus tiempos de comida. Emitir además un DELETE explícito para los hijos
    /// haría que ese comando afectara 0 filas y EF lo tomaría como conflicto
    /// de concurrencia.
    /// </summary>
    public void EliminarDias(IEnumerable<DiaDieta> dias) =>
        db.DiasDieta.RemoveRange(dias);

    public async Task<bool> PacientePerteneceAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await db.Pacientes.AnyAsync(p => p.Id == pacienteId && p.NutricionistaId == nutricionistaId, ct);

    public async Task GuardarCambiosAsync(CancellationToken ct) => await db.SaveChangesAsync(ct);
}
