using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NutriSoftware.Application.Common.Interfaces;

namespace NutriSoftware.Infrastructure.Services;

/// <summary>
/// Envía correo por SMTP.
///
/// Se eligió SMTP y no la API de un proveedor concreto porque funciona con
/// cualquiera —Brevo, Resend, SendGrid, Gmail— cambiando solo variables de
/// entorno, sin atarse a ninguno ni sumar dependencias.
///
/// Configuración:
///   Correo__Host       smtp.proveedor.com
///   Correo__Puerto     587
///   Correo__Usuario
///   Correo__Clave
///   Correo__Remitente  no-reply@tudominio.com
///   Correo__Nombre     NutriSoftware
///
/// Sin <c>Correo__Host</c> el servicio queda desactivado y lo informa por
/// <see cref="Configurado"/>; no lanza excepción.
/// </summary>
public class ServicioCorreoSmtp(IConfiguration config, ILogger<ServicioCorreoSmtp> logger)
    : IServicioCorreo
{
    private string? Host => config["Correo:Host"];

    public bool Configurado => !string.IsNullOrWhiteSpace(Host);

    public async Task EnviarAsync(
        string destinatario, string asunto, string cuerpoHtml, CancellationToken ct = default)
    {
        if (!Configurado)
        {
            // No se lanza: quien llama ya decide qué hacer según Configurado.
            // Tumbar el registro porque falta el SMTP sería peor que seguir.
            logger.LogWarning(
                "Correo no configurado; no se envió «{Asunto}» a {Destinatario}.",
                asunto, destinatario);
            return;
        }

        var puerto = int.TryParse(config["Correo:Puerto"], out var p) ? p : 587;
        var remitente = config["Correo:Remitente"] ?? config["Correo:Usuario"] ?? "no-reply@localhost";
        var nombre = config["Correo:Nombre"] ?? "NutriSoftware";

        // Configurable: los proveedores reales exigen TLS, pero un servidor
        // de pruebas en local no lo soporta y forzarlo aborta el envio.
        var usarSsl = !string.Equals(config["Correo:UsarSsl"], "false", StringComparison.OrdinalIgnoreCase);

        using var cliente = new SmtpClient(Host, puerto)
        {
            EnableSsl = usarSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
        };

        var usuario = config["Correo:Usuario"];
        var clave = config["Correo:Clave"];
        if (!string.IsNullOrWhiteSpace(usuario))
        {
            cliente.UseDefaultCredentials = false;
            cliente.Credentials = new NetworkCredential(usuario, clave);
        }

        using var mensaje = new MailMessage
        {
            From = new MailAddress(remitente, nombre),
            Subject = asunto,
            Body = cuerpoHtml,
            IsBodyHtml = true,
        };
        mensaje.To.Add(destinatario);

        await cliente.SendMailAsync(mensaje, ct);
        logger.LogInformation("Correo «{Asunto}» enviado a {Destinatario}.", asunto, destinatario);
    }
}
