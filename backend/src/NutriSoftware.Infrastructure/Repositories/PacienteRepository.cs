using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class PacienteRepository(ApplicationDbContext db) : IPacienteRepository
{
    public async Task<List<Paciente>> ObtenerPorNutricionistaAsync(
        Guid nutricionistaId, string? busqueda, bool? activo, CancellationToken ct)
    {
        var query = db.Pacientes
            .Include(p => p.Citas)
            .Where(p => p.NutricionistaId == nutricionistaId);

        if (activo.HasValue)
            query = query.Where(p => p.Activo == activo.Value);

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var q = busqueda.ToLowerInvariant();
            query = query.Where(p =>
                p.Nombres.ToLower().Contains(q) ||
                p.Apellidos.ToLower().Contains(q) ||
                (p.Email != null && p.Email.Contains(q)) ||
                (p.Dni != null && p.Dni.Contains(q)));
        }

        return await query.OrderBy(p => p.Apellidos).ThenBy(p => p.Nombres).ToListAsync(ct);
    }

    public async Task<Paciente?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await db.Pacientes
            .Include(p => p.Citas)
            .FirstOrDefaultAsync(p => p.Id == id && p.NutricionistaId == nutricionistaId, ct);

    public async Task AgregarAsync(Paciente paciente, CancellationToken ct) =>
        await db.Pacientes.AddAsync(paciente, ct);

    public async Task<int> ContarActivosAsync(Guid nutricionistaId, CancellationToken ct) =>
        await db.Pacientes.CountAsync(
            p => p.NutricionistaId == nutricionistaId && p.Activo, ct);

    public async Task GuardarCambiosAsync(CancellationToken ct) =>
        await db.SaveChangesAsync(ct);
}
