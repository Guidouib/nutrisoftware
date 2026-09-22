using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Domain.Interfaces;

public interface IEvaluacionRepository
{
    /// <summary>Evaluaciones de un tipo para un paciente, de la más reciente a la más antigua.</summary>
    Task<List<Evaluacion>> ObtenerPorPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, TipoEvaluacion tipo, CancellationToken ct = default);

    /// <summary>Última evaluación de un tipo, o <c>null</c> si el paciente no tiene ninguna.</summary>
    Task<Evaluacion?> ObtenerUltimaAsync(
        Guid pacienteId, Guid nutricionistaId, TipoEvaluacion tipo, CancellationToken ct = default);

    Task<Evaluacion?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);

    Task AgregarAsync(Evaluacion evaluacion, CancellationToken ct = default);
    void Eliminar(Evaluacion evaluacion);

    /// <summary>Confirma que el paciente existe y pertenece al nutricionista de la sesión.</summary>
    Task<bool> PacientePerteneceAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    Task GuardarCambiosAsync(CancellationToken ct = default);
}
