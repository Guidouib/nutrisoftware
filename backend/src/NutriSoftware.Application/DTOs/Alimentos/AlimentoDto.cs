namespace NutriSoftware.Application.DTOs.Alimentos;

public record AlimentoDto(
    Guid Id,
    string Nombre,
    string Fuente,
    string? Categoria,
    decimal Energia,
    decimal Proteinas,
    decimal Grasas,
    decimal Carbohidratos,
    decimal Fibra,
    decimal? Sodio,
    decimal? Calcio,
    decimal? Hierro,
    bool EsPersonalizado,
    DateTime FechaCreacion,

    /// <summary>
    /// Composición completa por 100 g, nutriente → valor, para los alimentos
    /// que la traen (la tabla peruana aporta 22). Un nutriente ausente
    /// significa que la tabla no tiene el dato, no que valga cero.
    ///
    /// Va como parámetro opcional al final para no tocar los sitios que ya
    /// construyen el DTO: Sodio, Calcio y Hierro siguen expuestos aparte y
    /// las pantallas que solo usan macronutrientes no se enteran.
    /// </summary>
    Dictionary<string, decimal?>? Micronutrientes = null
);
