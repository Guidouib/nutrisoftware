namespace NutriSoftware.Domain.Entities;

public class Nutricionista
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string? Telefono { get; set; }
    public string? NumeroColegiatura { get; set; }
    public string? FotoUrl { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
    public ICollection<Paciente> Pacientes { get; set; } = [];
    public ICollection<Cita> Citas { get; set; } = [];
    public ICollection<Alimento> AlimentosPersonalizados { get; set; } = [];
}
