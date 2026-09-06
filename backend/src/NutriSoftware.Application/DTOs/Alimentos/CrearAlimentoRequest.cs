namespace NutriSoftware.Application.DTOs.Alimentos;

public record CrearAlimentoRequest(
    string Nombre,
    string? Categoria,
    decimal Energia,
    decimal Proteinas,
    decimal Grasas,
    decimal Carbohidratos,
    decimal Fibra,
    decimal? Sodio,
    decimal? Calcio,
    decimal? Hierro
);
