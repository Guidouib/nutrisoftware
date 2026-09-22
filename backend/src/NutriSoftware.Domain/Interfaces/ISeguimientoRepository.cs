using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface ISeguimientoRepository
{
    /// <summary>Controles del paciente, del más reciente al más antiguo.</summary>
    Task<List<Seguimiento>> ObtenerPorPacienteAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    Task<Seguimiento?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);

    Task AgregarAsync(Seguimiento control, CancellationToken ct = default);
    void Eliminar(Seguimiento control);

    /// <summary>Paciente con su meta de peso, para leerla y actualizarla.</summary>
    Task<Paciente?> ObtenerPacienteAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    Task GuardarCambiosAsync(CancellationToken ct = default);
}
