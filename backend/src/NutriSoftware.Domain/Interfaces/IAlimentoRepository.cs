using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface IAlimentoRepository
{
    Task<List<Alimento>> ObtenerAsync(Guid nutricionistaId, string? fuente, string? categoria, string? busqueda, CancellationToken ct = default);
    Task<Alimento?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
    Task AgregarAsync(Alimento alimento, CancellationToken ct = default);
    Task EliminarAsync(Alimento alimento, CancellationToken ct = default);
    Task GuardarCambiosAsync(CancellationToken ct = default);
}
