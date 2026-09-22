namespace NutriSoftware.Application.DTOs.Reportes;

/// <summary>Secciones que el nutricionista decide incluir en el documento.</summary>
public record SeccionesPdfDto(
    bool DatosPaciente,
    bool Requerimientos,
    bool DietaPorDia,
    bool ListaCompras,
    bool Recomendaciones,
    bool Firma
);

public record ConfiguracionPdfDto(
    string Titulo,
    string? LogoDataUrl,
    string Consultorio,
    string Profesional,
    string? Contacto,
    SeccionesPdfDto Secciones,
    string? Recomendaciones,
    string EsquemaColor,
    string Fuente
);

public record GenerarPdfRequest(
    Guid PacienteId,
    Guid DietaId,
    ConfiguracionPdfDto Configuracion
);

/// <summary>
/// Reporte archivado. <c>Url</c> apunta al endpoint de descarga, que exige el
/// token de sesión: el frontend lo pide con axios y arma un blob local.
/// </summary>
public record PdfGeneradoDto(
    Guid Id,
    Guid PacienteId,
    Guid? DietaId,
    string Tipo,
    DateTime Fecha,
    long? TamanioBytes,
    string? Url,
    string Estado
);
