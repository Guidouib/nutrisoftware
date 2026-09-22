using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface IDietaRepository
{
    Task<List<Dieta>> ObtenerPorPacienteAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    /// <summary>Dieta completa con sus días y tiempos de comida.</summary>
    Task<Dieta?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);

    Task AgregarAsync(Dieta dieta, CancellationToken ct = default);
    void Eliminar(Dieta dieta);

    /// <summary>Borra los tiempos de comida de un día antes de regrabarlo.</summary>
    void EliminarTiempos(IEnumerable<TiempoComida> tiempos);

    /// <summary>Borra días completos (solo cuando el plan deja de incluirlos).</summary>
    void EliminarDias(IEnumerable<DiaDieta> dias);

    Task<bool> PacientePerteneceAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    Task GuardarCambiosAsync(CancellationToken ct = default);
}
