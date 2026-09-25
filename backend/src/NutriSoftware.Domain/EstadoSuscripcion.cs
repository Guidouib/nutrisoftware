using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Domain;

/// <summary>Situación de la suscripción, deducida de la fecha y el interruptor.</summary>
public enum EstadoSuscripcion
{
    /// <summary>Sin vencimiento: cuenta interna o de cortesía.</summary>
    SinVencimiento,

    /// <summary>Al día.</summary>
    Activa,

    /// <summary>Vence dentro de pocos días; se avisa pero no se bloquea.</summary>
    PorVencer,

    /// <summary>La fecha ya pasó.</summary>
    Vencida,

    /// <summary>Cortada a mano, sin importar la fecha.</summary>
    Suspendida,
}

public static class Suscripcion
{
    /// <summary>Días de antelación con que se empieza a avisar el vencimiento.</summary>
    public const int DiasDeAviso = 7;

    public static EstadoSuscripcion Estado(Nutricionista n, DateOnly hoy)
    {
        if (n.SuscripcionSuspendida) return EstadoSuscripcion.Suspendida;
        if (n.SuscripcionHasta is null) return EstadoSuscripcion.SinVencimiento;

        var dias = n.SuscripcionHasta.Value.DayNumber - hoy.DayNumber;

        // El último día se cuenta completo: vencer a las 00:00 del día que el
        // cliente cree que todavía tiene pago se siente como un error.
        if (dias < 0) return EstadoSuscripcion.Vencida;

        return dias <= DiasDeAviso ? EstadoSuscripcion.PorVencer : EstadoSuscripcion.Activa;
    }

    /// <summary>Solo Vencida y Suspendida cierran el paso.</summary>
    public static bool PermiteAcceso(EstadoSuscripcion estado) =>
        estado is not (EstadoSuscripcion.Vencida or EstadoSuscripcion.Suspendida);

    public static int? DiasRestantes(Nutricionista n, DateOnly hoy) =>
        n.SuscripcionHasta is null ? null : n.SuscripcionHasta.Value.DayNumber - hoy.DayNumber;
}
