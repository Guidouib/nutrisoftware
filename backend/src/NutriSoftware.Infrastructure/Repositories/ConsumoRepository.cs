using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class ConsumoRepository(ApplicationDbContext db) : IConsumoRepository
{
    private IQueryable<RegistroConsumo> DelNutricionista(Guid nutricionistaId) =>
        db.RegistrosConsumo.Where(r => r.Paciente.NutricionistaId == nutricionistaId);

    public async Task<List<RegistroConsumo>> ObtenerPorPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(r => r.PacienteId == pacienteId)
            .Include(r => r.Items)
            .OrderByDescending(r => r.Fecha)
            .ThenByDescending(r => r.FechaCreacion)
            .ToListAsync(ct);

    public async Task<RegistroConsumo?> ObtenerPorIdAsync(
        Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Include(r => r.Items.OrderBy(i => i.Orden))
            .FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task AgregarAsync(RegistroConsumo registro, CancellationToken ct) =>
        await db.RegistrosConsumo.AddAsync(registro, ct);

    public void Eliminar(RegistroConsumo registro) => db.RegistrosConsumo.Remove(registro);

    public void EliminarItems(IEnumerable<ItemConsumo> items) =>
        db.ItemsConsumo.RemoveRange(items);

    public async Task<List<ItemConsumo>> ObtenerItemsDelPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await db.ItemsConsumo
            .Where(i => i.RegistroConsumo.PacienteId == pacienteId
                     && i.RegistroConsumo.Paciente.NutricionistaId == nutricionistaId)
            .Include(i => i.RegistroConsumo)
            .OrderBy(i => i.RegistroConsumo.Fecha)
            .ThenBy(i => i.Orden)
            .ToListAsync(ct);

    public async Task<bool> PacientePerteneceAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await db.Pacientes.AnyAsync(
            p => p.Id == pacienteId && p.NutricionistaId == nutricionistaId, ct);

    public async Task GuardarCambiosAsync(CancellationToken ct) =>
        await db.SaveChangesAsync(ct);
}
