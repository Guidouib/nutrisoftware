namespace NutriSoftware.Domain.Entities;

public class Dieta
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Fecha a la que corresponde el plan (la elige el nutricionista).</summary>
    public DateOnly Fecha { get; set; }

    /* ── Requerimientos objetivo, copiados de la evaluación vigente ──
       Se guardan en la dieta y no se leen de la evaluación en cada consulta:
       el plan queda con los valores con los que realmente se construyó, aunque
       después el paciente sea reevaluado. */
    public decimal? CaloriasObjetivo { get; set; }
    public decimal? ProteinasObjetivo { get; set; }
    public decimal? CarbohidratosObjetivo { get; set; }
    public decimal? GrasasObjetivo { get; set; }

    public bool ModoIntercambios { get; set; }

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
    public ICollection<DiaDieta> Dias { get; set; } = [];
    public ICollection<PdfGenerado> PdfsGenerados { get; set; } = [];
}

public class DiaDieta
{
    public Guid Id { get; set; }
    public Guid DietaId { get; set; }

    /// <summary>0 = lunes … 6 = domingo.</summary>
    public int DiaSemana { get; set; }

    public Dieta Dieta { get; set; } = null!;
    public ICollection<TiempoComida> TiemposComida { get; set; } = [];
}

public class TiempoComida
{
    public Guid Id { get; set; }
    public Guid DiaDietaId { get; set; }
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Alimentos asignados, con sus valores por 100 g y la cantidad.</summary>
    public string AlimentosJson { get; set; } = "[]";

    /// <summary>Totales precalculados del tiempo de comida.</summary>
    public string TotalesJson { get; set; } = "{}";

    /// <summary>Preserva el orden en que el nutricionista definió los tiempos.</summary>
    public int Orden { get; set; }

    public DiaDieta DiaDieta { get; set; } = null!;
}
