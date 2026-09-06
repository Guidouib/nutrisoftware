using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class AlimentoRepository(ApplicationDbContext db) : IAlimentoRepository
{
    public async Task<List<Alimento>> ObtenerAsync(
        Guid nutricionistaId, string? fuente, string? categoria, string? busqueda, CancellationToken ct)
    {
        var query = db.Alimentos.Where(a =>
            !a.EsPersonalizado ||
            a.NutricionistaId == nutricionistaId);

        if (!string.IsNullOrWhiteSpace(fuente) &&
            Enum.TryParse<FuenteAlimento>(fuente, true, out var fuenteEnum))
            query = query.Where(a => a.Fuente == fuenteEnum);

        if (!string.IsNullOrWhiteSpace(categoria))
            query = query.Where(a => a.Categoria != null && a.Categoria.ToLower() == categoria.ToLower());

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var q = busqueda.ToLowerInvariant();
            query = query.Where(a =>
                a.Nombre.ToLower().Contains(q) ||
                (a.Categoria != null && a.Categoria.ToLower().Contains(q)));
        }

        return await query.OrderBy(a => a.Nombre).ToListAsync(ct);
    }

    public async Task<Alimento?> ObtenerPorIdAsync(Guid id, CancellationToken ct) =>
        await db.Alimentos.FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task AgregarAsync(Alimento alimento, CancellationToken ct) =>
        await db.Alimentos.AddAsync(alimento, ct);

    public Task EliminarAsync(Alimento alimento, CancellationToken ct)
    {
        db.Alimentos.Remove(alimento);
        return Task.CompletedTask;
    }

    public async Task GuardarCambiosAsync(CancellationToken ct) =>
        await db.SaveChangesAsync(ct);
}
