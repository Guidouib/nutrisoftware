using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface IPacienteRepository
{
    Task<List<Paciente>> ObtenerPorNutricionistaAsync(Guid nutricionistaId, string? busqueda, bool? activo, CancellationToken ct = default);
    Task<Paciente?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);
    Task AgregarAsync(Paciente paciente, CancellationToken ct = default);
    Task GuardarCambiosAsync(CancellationToken ct = default);
}
