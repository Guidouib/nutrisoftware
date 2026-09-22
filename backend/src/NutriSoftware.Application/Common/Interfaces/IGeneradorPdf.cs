using NutriSoftware.Application.DTOs.Dietas;
using NutriSoftware.Application.DTOs.Reportes;

namespace NutriSoftware.Application.Common.Interfaces;

/// <summary>Datos del paciente que aparecen en el encabezado del reporte.</summary>
public record PacienteReporteDto(string NombreCompleto, int Edad, string Sexo, string? Dni);

/// <summary>Renglón de la lista de compras: gramos totales de la semana.</summary>
public record ItemCompraDto(string Nombre, string Fuente, decimal Gramos);

public record DatosPlanNutricional(
    PacienteReporteDto Paciente,
    DietaDto Dieta,
    List<ItemCompraDto> ListaCompras,
    ConfiguracionPdfDto Configuracion
);

/// <summary>Composición del PDF. La implementación vive en Infrastructure (QuestPDF).</summary>
public interface IGeneradorPdf
{
    byte[] GenerarPlanNutricional(DatosPlanNutricional datos);
}
