namespace NutriSoftware.Domain.Entities;

/// <summary>
/// Recordatorio de consumo de un paciente en una fecha: qué comió y cuánto,
/// cuantificado contra la tabla de composición.
///
/// A diferencia de <see cref="Dieta"/>, que prescribe lo que el paciente
/// debería comer, esto registra lo que declaró haber comido. Por eso vive en
/// su propia tabla y no reutiliza el plan: son dos hechos distintos sobre el
/// mismo paciente y se comparan entre sí.
/// </summary>
public class RegistroConsumo
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }

    /// <summary>Día al que corresponde lo declarado, no el día de la carga.</summary>
    public DateOnly Fecha { get; set; }

    /// <summary>Etiqueta libre: "Recordatorio 24 h", "Día habitual", "Fin de semana".</summary>
    public string Titulo { get; set; } = string.Empty;

    public string? Observaciones { get; set; }

    /// <summary>Quién tomó el recordatorio. Queda como firma del registro.</summary>
    public Guid NutricionistaId { get; set; }

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    public Paciente Paciente { get; set; } = null!;
    public Nutricionista Nutricionista { get; set; } = null!;
    public ICollection<ItemConsumo> Items { get; set; } = [];
}

/// <summary>
/// Un alimento declarado dentro de un recordatorio, con su cantidad.
///
/// Es una tabla propia y no un JSON dentro del registro —a diferencia de los
/// alimentos de una dieta— porque acá cada línea es el dato de análisis: se
/// exporta plana, se agrupa por alimento y se compara entre pacientes.
/// </summary>
public class ItemConsumo
{
    public Guid Id { get; set; }
    public Guid RegistroConsumoId { get; set; }

    /// <summary>Momento del día declarado: Desayuno, Media mañana, Almuerzo…</summary>
    public string TiempoComida { get; set; } = string.Empty;

    /// <summary>Preserva el orden de carga dentro del tiempo de comida.</summary>
    public int Orden { get; set; }

    /// <summary>
    /// Alimento del catálogo. Queda en null si después se elimina el alimento:
    /// el registro histórico no se pierde porque el nombre y la composición
    /// viajan copiados en esta misma fila.
    /// </summary>
    public Guid? AlimentoId { get; set; }

    /// <summary>Nombre al momento de la carga. No se re-lee del catálogo.</summary>
    public string NombreAlimento { get; set; } = string.Empty;

    public decimal Gramos { get; set; }

    /// <summary>
    /// Composición por 100 g congelada al momento de registrar, como
    /// diccionario nutriente → valor. Un nutriente ausente significa
    /// "la tabla no tiene el dato", que no es lo mismo que cero.
    ///
    /// Se guarda copiada a propósito: si mañana se corrige la tabla de
    /// composición, los recordatorios ya tomados siguen reproduciendo el
    /// cálculo con el que se informaron.
    /// </summary>
    public string ComposicionJson { get; set; } = "{}";

    /// <summary>
    /// Animal, Vegetal o Mixto. Determina si el hierro del alimento cuenta
    /// como hemo, no hemo o queda sin atribuir.
    ///
    /// Se deriva del grupo del alimento en vez de pedirse en cada carga —el
    /// Excel obligaba a elegirlo a mano cada vez— y se puede corregir cuando
    /// el caso lo amerite.
    /// </summary>
    public string OrigenAlimento { get; set; } = "Vegetal";

    public RegistroConsumo RegistroConsumo { get; set; } = null!;
}
