namespace NutriSoftware.Domain.Entities;

public class Seguimiento
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public DateTime Fecha { get; set; }
    public decimal? Peso { get; set; }
    public string? MedidasJson { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
}
