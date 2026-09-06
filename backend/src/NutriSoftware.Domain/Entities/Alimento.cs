using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Domain.Entities;

public class Alimento
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public FuenteAlimento Fuente { get; set; }
    public string? Categoria { get; set; }
    public decimal Energia { get; set; }
    public decimal Proteinas { get; set; }
    public decimal Grasas { get; set; }
    public decimal Carbohidratos { get; set; }
    public decimal Fibra { get; set; }
    public string? MicronutrientesJson { get; set; }
    public bool EsPersonalizado { get; set; }
    public Guid? NutricionistaId { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Nutricionista? Nutricionista { get; set; }
}
