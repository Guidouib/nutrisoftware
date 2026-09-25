namespace NutriSoftware.Application.Common.Interfaces;

/// <summary>
/// Envío de correo. Se declara acá y se implementa en Infrastructure, igual
/// que <c>IJwtService</c> o <c>IGeneradorPdf</c>.
/// </summary>
public interface IServicioCorreo
{
    /// <summary>
    /// <c>false</c> cuando no hay servidor SMTP configurado.
    ///
    /// Importa: si no se puede enviar el correo de verificación, las cuentas
    /// nuevas se dan por verificadas al crearse. De lo contrario nadie podría
    /// entrar nunca y una configuración incompleta dejaría el sistema
    /// inutilizable.
    /// </summary>
    bool Configurado { get; }

    Task EnviarAsync(string destinatario, string asunto, string cuerpoHtml, CancellationToken ct = default);
}
