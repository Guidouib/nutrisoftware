using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface IConsumoRepository
{
    /// <summary>Cabeceras de los recordatorios de un paciente, sin sus items.</summary>
    Task<List<RegistroConsumo>> ObtenerPorPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    /// <summary>Registro completo con sus items, en orden de carga.</summary>
    Task<RegistroConsumo?> ObtenerPorIdAsync(
        Guid id, Guid nutricionistaId, CancellationToken ct = default);

    Task AgregarAsync(RegistroConsumo registro, CancellationToken ct = default);
    void Eliminar(RegistroConsumo registro);

    /// <summary>
    /// Borra los items de un registro antes de regrabarlos. Solo los items:
    /// la FK está en cascada, así que borrar el registro ya se los lleva y
    /// emitir el DELETE por duplicado terminaría en un conflicto de
    /// concurrencia de EF (afectaría 0 filas).
    /// </summary>
    void EliminarItems(IEnumerable<ItemConsumo> items);

    /// <summary>Items de todos los registros de un paciente, para exportar.</summary>
    Task<List<ItemConsumo>> ObtenerItemsDelPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    Task<bool> PacientePerteneceAsync(
        Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    Task GuardarCambiosAsync(CancellationToken ct = default);
}
