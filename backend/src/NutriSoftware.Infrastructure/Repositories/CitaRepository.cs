using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class CitaRepository(ApplicationDbContext db) : ICitaRepository
{
    public async Task<List<Cita>> ObtenerPorNutricionistaAsync(
        Guid nutricionistaId, int? mes, int? anio, Guid? pacienteId, CancellationToken ct)
    {
        var query = db.Citas
            .Include(c => c.Paciente)
            .Where(c => c.NutricionistaId == nutricionistaId);

        if (mes.HasValue)
            query = query.Where(c => c.FechaHora.Month == mes.Value);

        if (anio.HasValue)
            query = query.Where(c => c.FechaHora.Year == anio.Value);

        if (pacienteId.HasValue)
            query = query.Where(c => c.PacienteId == pacienteId.Value);

        return await query.OrderBy(c => c.FechaHora).ToListAsync(ct);
    }

    public async Task<Cita?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await db.Citas
            .Include(c => c.Paciente)
            .FirstOrDefaultAsync(c => c.Id == id && c.NutricionistaId == nutricionistaId, ct);

    public async Task AgregarAsync(Cita cita, CancellationToken ct) =>
        await db.Citas.AddAsync(cita, ct);

    public Task EliminarAsync(Cita cita, CancellationToken ct)
    {
        db.Citas.Remove(cita);
        return Task.CompletedTask;
    }

    public async Task GuardarCambiosAsync(CancellationToken ct) =>
        await db.SaveChangesAsync(ct);
}
