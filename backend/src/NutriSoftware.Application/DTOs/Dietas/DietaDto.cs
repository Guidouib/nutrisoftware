namespace NutriSoftware.Application.DTOs.Dietas;

/// <summary>Requerimientos objetivo con los que se construyó el plan.</summary>
public record RequerimientosDto(
    decimal Kcal,
    decimal ProteinasG,
    decimal CarbohidratosG,
    decimal GrasasG
);

/// <summary>
/// Alimento asignado a un tiempo de comida. Los valores nutricionales viajan
/// por 100 g junto a la cantidad, para que el frontend recalcule los totales
/// al mover los gramos sin volver a consultar la base de alimentos.
/// </summary>
public record AlimentoEnDietaDto(
    string Id,
    Guid AlimentoId,
    string Nombre,
    string Fuente,
    decimal Gramos,
    decimal Energia100,
    decimal Proteinas100,
    decimal Grasas100,
    decimal Carbohidratos100,
    decimal Fibra100
);

public record TiempoComidaDto(
    string Id,
    string Nombre,
    List<AlimentoEnDietaDto> Alimentos
);

public record DiaDietaDto(
    int DiaSemana,
    List<TiempoComidaDto> Tiempos
);

public record DietaDto(
    Guid Id,
    Guid PacienteId,
    DateOnly Fecha,
    string Nombre,
    RequerimientosDto Requerimientos,
    List<DiaDietaDto> Dias,
    bool ModoIntercambios
);
