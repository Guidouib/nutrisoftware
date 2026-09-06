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
    DateTime FechaCreacion
);
