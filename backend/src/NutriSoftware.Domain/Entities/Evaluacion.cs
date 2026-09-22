using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Domain.Entities;

/// <summary>
/// Evaluación nutricional de cualquiera de los siete sub-módulos.
///
/// Los campos que el servidor necesita consultar u ordenar (paciente, tipo,
/// fecha, diagnóstico) son columnas propias; las mediciones específicas de cada
/// tipo —pliegues ISAK, Z-scores OMS, valores de laboratorio, signos clínicos—
/// viven en <see cref="DatosJson"/>, siguiendo el <c>datos_json</c> del esquema
/// del plan. Así un cambio en el formulario de un sub-módulo no obliga a migrar
/// la base de datos.
/// </summary>
public class Evaluacion
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public TipoEvaluacion Tipo { get; set; }
    public DateOnly Fecha { get; set; }

    /// <summary>Objeto JSON con las mediciones y resultados del sub-módulo.</summary>
    public string DatosJson { get; set; } = "{}";

    public string? Diagnostico { get; set; }
    public string? Prescripcion { get; set; }

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
}
