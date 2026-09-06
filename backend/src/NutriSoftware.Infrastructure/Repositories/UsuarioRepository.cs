using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class UsuarioRepository(ApplicationDbContext db) : IUsuarioRepository
{
    public async Task<Usuario?> ObtenerPorEmailAsync(string email, CancellationToken ct) =>
        await db.Usuarios
            .Include(u => u.Nutricionista)
            .Include(u => u.Paciente)
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken ct) =>
        await db.Usuarios
            .Include(u => u.Nutricionista)
            .Include(u => u.Paciente)
            .FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<bool> ExisteEmailAsync(string email, CancellationToken ct) =>
        await db.Usuarios.AnyAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task AgregarAsync(Usuario usuario, CancellationToken ct) =>
        await db.Usuarios.AddAsync(usuario, ct);

    public async Task<RefreshToken?> ObtenerRefreshTokenAsync(string token, CancellationToken ct) =>
        await db.RefreshTokens
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.Token == token && !r.Revocado && r.Expira > DateTime.UtcNow, ct);

    public async Task AgregarRefreshTokenAsync(RefreshToken token, CancellationToken ct) =>
        await db.RefreshTokens.AddAsync(token, ct);

    public async Task GuardarCambiosAsync(CancellationToken ct) =>
        await db.SaveChangesAsync(ct);
}
