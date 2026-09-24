namespace NutriSoftware.Domain.Entities;

public class Paciente
{
    public Guid Id { get; set; }
    public Guid NutricionistaId { get; set; }
    public Guid? UsuarioId { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public DateOnly FechaNacimiento { get; set; }
    public string Sexo { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Dni { get; set; }
    public string? Direccion { get; set; }
    public string? FotoUrl { get; set; }
    public string? Notas { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Meta de peso del tratamiento; alimenta la linea de meta del seguimiento.</summary>
    public decimal? PesoObjetivo { get; set; }

    public Nutricionista Nutricionista { get; set; } = null!;
    public Usuario? Usuario { get; set; }
    public ICollection<Cita> Citas { get; set; } = [];
    public ICollection<Dieta> Dietas { get; set; } = [];
    public ICollection<Seguimiento> Seguimientos { get; set; } = [];
    public ICollection<Evaluacion> Evaluaciones { get; set; } = [];
    public ICollection<RegistroConsumo> RegistrosConsumo { get; set; } = [];
    public ICollection<PdfGenerado> PdfsGenerados { get; set; } = [];
}
