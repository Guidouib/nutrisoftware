namespace NutriSoftware.Domain.Entities;

/// <summary>
/// Reporte PDF emitido para un paciente, archivado en su expediente.
///
/// El binario se guarda en la propia base (<see cref="Contenido"/>) en vez de
/// en almacenamiento externo: un plan nutricional pesa unas decenas de KB y
/// evita depender de un bucket para que la descarga funcione. Si el volumen
/// crece, se reemplaza por una URL sin tocar el resto del flujo.
/// </summary>
public class PdfGenerado
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? DietaId { get; set; }

    public string Tipo { get; set; } = string.Empty;
    public string NombreArchivo { get; set; } = string.Empty;
    public byte[] Contenido { get; set; } = [];
    public long TamanioBytes { get; set; }

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
    public Dieta? Dieta { get; set; }
}
