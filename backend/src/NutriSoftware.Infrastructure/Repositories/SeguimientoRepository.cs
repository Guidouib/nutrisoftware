using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class SeguimientoRepository(ApplicationDbContext db) : ISeguimientoRepository
{
    private IQueryable<Seguimiento> DelNutricionista(Guid nutricionistaId) =>
        db.Seguimientos.Where(s => s.Paciente.NutricionistaId == nutricionistaId);

    public async Task<List<Seguimiento>> ObtenerPorPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(s => s.PacienteId == pacienteId)
            .OrderByDescending(s => s.Fecha)
            .ThenByDescending(s => s.FechaCreacion)
            .ToListAsync(ct);

    public async Task<Seguimiento?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId).FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task AgregarAsync(Seguimiento control, CancellationToken ct) =>
        await db.Seguimientos.AddAsync(control, ct);

    public void Eliminar(Seguimiento control) => db.Seguimientos.Remove(control);

    public async Task<Paciente?> ObtenerPacienteAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await db.Pacientes.FirstOrDefaultAsync(
            p => p.Id == pacienteId && p.NutricionistaId == nutricionistaId, ct);

    public async Task GuardarCambiosAsync(CancellationToken ct) => await db.SaveChangesAsync(ct);
}
