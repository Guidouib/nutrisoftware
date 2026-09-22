namespace NutriSoftware.Domain.Entities;

public class Seguimiento
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public DateOnly Fecha { get; set; }

    public decimal Peso { get; set; }

    /// <summary>Solo se registra cuando se vuelve a tallar al paciente.</summary>
    public decimal? Talla { get; set; }

    /// <summary>Perímetros del control: abdominal, cintura, cadera y brazo.</summary>
    public string? MedidasJson { get; set; }

    /// <summary>Adherencia declarada al plan, de 1 (nula) a 5 (total).</summary>
    public int Cumplimiento { get; set; } = 3;

    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
}
