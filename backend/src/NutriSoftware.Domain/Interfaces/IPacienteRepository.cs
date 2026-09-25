using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface IPacienteRepository
{
    Task<List<Paciente>> ObtenerPorNutricionistaAsync(Guid nutricionistaId, string? busqueda, bool? activo, CancellationToken ct = default);
    Task<Paciente?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);
    Task AgregarAsync(Paciente paciente, CancellationToken ct = default);

    /// <summary>
    /// Pacientes activos del nutricionista. Se cuenta en la base y no sobre
    /// una lista traída a memoria: con el tope del plan se consulta en cada
    /// alta y traer todos los registros para contarlos no tiene sentido.
    /// </summary>
    Task<int> ContarActivosAsync(Guid nutricionistaId, CancellationToken ct = default);

    Task GuardarCambiosAsync(CancellationToken ct = default);
}
