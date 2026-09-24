namespace NutriSoftware.Domain;

/// <summary>Un nutriente de la tabla de composición.</summary>
/// <param name="Clave">Clave estable usada en los JSON de composición.</param>
/// <param name="Etiqueta">Nombre para mostrar.</param>
/// <param name="Unidad">Unidad por 100 g de alimento.</param>
/// <param name="Decimales">Decimales con los que se informa el total.</param>
public record Nutriente(string Clave, string Etiqueta, string Unidad, int Decimales);

/// <summary>
/// Catálogo de los 22 nutrientes de la tabla peruana de composición de
/// alimentos, en el orden en que se muestran.
///
/// Es la fuente única: el importador, el cálculo de totales y la exportación
/// recorren esta lista, así que agregar un nutriente es agregar una fila acá.
/// El frontend replica estas claves en <c>frontend/src/lib/nutrientes.ts</c>.
/// </summary>
public static class Nutrientes
{
    public static readonly IReadOnlyList<Nutriente> Todos =
    [
        new("energiaKcal",       "Energía",                 "kcal", 0),
        new("energiaKj",         "Energía",                 "kJ",   0),
        new("agua",              "Agua",                    "g",    1),
        new("proteinas",         "Proteínas",               "g",    1),
        new("grasaTotal",        "Grasa total",             "g",    1),
        new("carbohidratosTot",  "Carbohidratos totales",   "g",    1),
        new("carbohidratosDisp", "Carbohidratos disponibles", "g",  1),
        new("fibra",             "Fibra dietaria",          "g",    1),
        new("cenizas",           "Cenizas",                 "g",    1),
        new("calcio",            "Calcio",                  "mg",   1),
        new("fosforo",           "Fósforo",                 "mg",   1),
        new("zinc",              "Zinc",                    "mg",   2),
        new("hierro",            "Hierro",                  "mg",   2),
        new("betaCaroteno",      "β caroteno equivalentes", "µg",   1),
        new("vitaminaA",         "Vitamina A equivalentes", "µg",   1),
        new("tiamina",           "Tiamina",                 "mg",   2),
        new("riboflavina",       "Riboflavina",             "mg",   2),
        new("niacina",           "Niacina",                 "mg",   2),
        new("vitaminaC",         "Vitamina C",              "mg",   1),
        new("acidoFolico",       "Ácido fólico",            "µg",   1),
        new("sodio",             "Sodio",                   "mg",   1),
        new("potasio",           "Potasio",                 "mg",   1),
    ];

    public static readonly IReadOnlyList<string> Claves =
        Todos.Select(n => n.Clave).ToArray();

    /// <summary>
    /// Descomposición del hierro. No está en <see cref="Todos"/> porque no
    /// viene de la tabla: se calcula al sumar, repartiendo el hierro de cada
    /// alimento según su origen.
    ///
    /// La separación importa porque la biodisponibilidad del hierro hemo
    /// (15-35 %) y la del no hemo (2-20 %) no son comparables. Las
    /// preparaciones —sopas, segundos— caen en <see cref="HierroMixto"/>:
    /// contienen las dos formas y atribuirlas a una sola sería inventar.
    /// </summary>
    public const string HierroHemo = "hierroHemo";
    public const string HierroNoHemo = "hierroNoHemo";
    public const string HierroMixto = "hierroMixto";

    public const string OrigenAnimal = "Animal";
    public const string OrigenVegetal = "Vegetal";
    public const string OrigenMixto = "Mixto";

    /// <summary>Normaliza el origen a uno de los tres valores admitidos.</summary>
    public static string NormalizarOrigen(string? origen) => origen?.Trim().ToLowerInvariant() switch
    {
        "animal" => OrigenAnimal,
        "mixto" => OrigenMixto,
        _ => OrigenVegetal,
    };
}
