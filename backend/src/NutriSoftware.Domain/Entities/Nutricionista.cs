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

    /* ── Suscripción (cobro manual) ──────────────────────────────
       Dos campos y ninguna máquina de estados: «vencida» se deduce
       comparando la fecha con hoy, así no hace falta una tarea
       programada que vaya cambiando estados. */

    /// <summary>
    /// Último día con acceso, inclusive. <c>null</c> significa sin
    /// vencimiento —cuentas internas o cortesía—, no bloqueada.
    /// </summary>
    public DateOnly? SuscripcionHasta { get; set; }

    /// <summary>
    /// Corta el acceso sin importar la fecha. Para bajas o morosidad, sin
    /// tener que retroceder el vencimiento y perder el dato de hasta cuándo
    /// había pagado.
    /// </summary>
    public bool SuscripcionSuspendida { get; set; }

    /// <summary>
    /// Anotación libre del cobro: «Yape 15/09, S/50, 3 meses». Con cobro
    /// manual, este texto es el único registro de lo que se acordó.
    /// </summary>
    public string? NotaSuscripcion { get; set; }

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
    public ICollection<Paciente> Pacientes { get; set; } = [];
    public ICollection<Cita> Citas { get; set; } = [];
    public ICollection<Alimento> AlimentosPersonalizados { get; set; } = [];
}
