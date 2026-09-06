using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Domain.Entities;

public class Cita
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public Guid NutricionistaId { get; set; }
    public DateTime FechaHora { get; set; }
    public TipoConsulta TipoConsulta { get; set; }
    public ModalidadCita Modalidad { get; set; } = ModalidadCita.Presencial;
    public EstadoCita Estado { get; set; } = EstadoCita.Programada;
    public int DuracionMinutos { get; set; } = 60;
    public string? Notas { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
    public Nutricionista Nutricionista { get; set; } = null!;
}
