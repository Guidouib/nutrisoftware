using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface ICitaRepository
{
    Task<List<Cita>> ObtenerPorNutricionistaAsync(Guid nutricionistaId, int? mes, int? anio, Guid? pacienteId, CancellationToken ct = default);
    Task<Cita?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);
    Task AgregarAsync(Cita cita, CancellationToken ct = default);
    Task EliminarAsync(Cita cita, CancellationToken ct = default);
    Task GuardarCambiosAsync(CancellationToken ct = default);
}
