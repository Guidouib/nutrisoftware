using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorEmailAsync(string email, CancellationToken ct = default);
    Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExisteEmailAsync(string email, CancellationToken ct = default);
    Task AgregarAsync(Usuario usuario, CancellationToken ct = default);

    /// <summary>Usuario dueño de un token de verificación de correo.</summary>
    Task<Usuario?> ObtenerPorTokenVerificacionAsync(string token, CancellationToken ct = default);
    Task<RefreshToken?> ObtenerRefreshTokenAsync(string token, CancellationToken ct = default);
    Task AgregarRefreshTokenAsync(RefreshToken token, CancellationToken ct = default);
    Task GuardarCambiosAsync(CancellationToken ct = default);
}
