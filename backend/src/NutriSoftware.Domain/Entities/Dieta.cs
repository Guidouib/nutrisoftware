namespace NutriSoftware.Domain.Entities;

public class Dieta
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal? CaloriasObjetivo { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
    public ICollection<DiaDieta> Dias { get; set; } = [];
}

public class DiaDieta
{
    public Guid Id { get; set; }
    public Guid DietaId { get; set; }
    public int DiaSemana { get; set; }

    public Dieta Dieta { get; set; } = null!;
    public ICollection<TiempoComida> TiemposComida { get; set; } = [];
}

public class TiempoComida
{
    public Guid Id { get; set; }
    public Guid DiaDietaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string AlimentosJson { get; set; } = "[]";
    public string TotalesJson { get; set; } = "{}";

    public DiaDieta DiaDieta { get; set; } = null!;
}
