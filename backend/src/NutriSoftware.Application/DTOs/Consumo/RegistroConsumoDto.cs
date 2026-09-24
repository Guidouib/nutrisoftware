namespace NutriSoftware.Application.DTOs.Consumo;

/// <summary>
/// Un alimento declarado. <c>Composicion</c> son los valores por 100 g tal
/// como los trae la tabla y <c>Aporte</c> lo que efectivamente suma con los
/// gramos declarados.
///
/// Ambos diccionarios usan <c>decimal?</c>: un nutriente en null significa que
/// la tabla de composición no tiene el dato para ese alimento, que no es lo
/// mismo que un cero. La tabla peruana tiene 5.009 celdas sin dato sobre
/// 41.140, así que la distinción cambia los totales de verdad.
/// </summary>
public record ItemConsumoDto(
    Guid Id,
    string TiempoComida,
    int Orden,
    Guid? AlimentoId,
    string NombreAlimento,
    decimal Gramos,
    string OrigenAlimento,
    Dictionary<string, decimal?> Composicion,
    Dictionary<string, decimal?> Aporte
);

/// <summary>
/// Totales del recordatorio con su propia trazabilidad de completitud.
///
/// <c>Valores</c> suma solo los items que tenían dato. <c>ItemsSinDato</c>
/// dice cuántos quedaron afuera en cada nutriente, para que la interfaz pueda
/// advertir que un total está incompleto en vez de presentarlo como firme.
/// </summary>
public record TotalesConsumoDto(
    Dictionary<string, decimal> Valores,
    Dictionary<string, int> ItemsSinDato,
    int TotalItems
);

public record RegistroConsumoDto(
    Guid Id,
    Guid PacienteId,
    DateOnly Fecha,
    string Titulo,
    string? Observaciones,
    DateTime FechaCreacion,
    DateTime FechaActualizacion,
    List<ItemConsumoDto> Items,
    TotalesConsumoDto Totales
);

/// <summary>Fila del listado: sin items, con lo justo para la tarjeta.</summary>
public record RegistroConsumoResumenDto(
    Guid Id,
    Guid PacienteId,
    DateOnly Fecha,
    string Titulo,
    int CantidadItems,
    decimal EnergiaKcal,
    decimal ProteinasG,
    DateTime FechaCreacion
);

/* ── Entrada ── */

public record ItemConsumoRequest(
    string TiempoComida,
    int Orden,
    Guid? AlimentoId,
    string NombreAlimento,
    decimal Gramos,
    string OrigenAlimento,
    Dictionary<string, decimal?> Composicion
);

/// <summary>
/// Cuerpo del <c>PUT /api/consumo/{id}</c>. Igual que el constructor de
/// dietas, la pantalla manda el recordatorio entero y el servidor lo regraba:
/// así la ruta es idempotente y el autoguardado no necesita distinguir entre
/// crear y actualizar.
/// </summary>
public record GuardarRegistroConsumoRequest(
    Guid PacienteId,
    DateOnly Fecha,
    string Titulo,
    string? Observaciones,
    List<ItemConsumoRequest> Items
);
