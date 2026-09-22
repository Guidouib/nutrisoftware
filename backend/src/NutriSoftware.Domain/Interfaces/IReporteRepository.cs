using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain.Interfaces;

public interface IReporteRepository
{
    /// <summary>Historial de reportes del paciente, del más reciente al más antiguo. Sin el binario.</summary>
    Task<List<PdfGenerado>> ObtenerPorPacienteAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct = default);

    /// <summary>Metadatos del reporte, sin cargar el binario.</summary>
    Task<PdfGenerado?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);

    /// <summary>Contenido binario del PDF, solo para la descarga.</summary>
    Task<byte[]?> ObtenerContenidoAsync(Guid id, Guid nutricionistaId, CancellationToken ct = default);

    Task AgregarAsync(PdfGenerado reporte, CancellationToken ct = default);

    Task GuardarCambiosAsync(CancellationToken ct = default);
}
