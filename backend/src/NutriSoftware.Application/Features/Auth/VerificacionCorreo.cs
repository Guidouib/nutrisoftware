using System.Security.Cryptography;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Application.Features.Auth;

/// <summary>
/// Arma y envía el correo con el enlace de verificación.
///
/// Compartido por el registro y por el reenvío, para que el texto y la
/// vigencia del token no se dupliquen ni se desincronicen.
/// </summary>
public static class VerificacionCorreo
{
    public static readonly TimeSpan Vigencia = TimeSpan.FromHours(24);

    /// <summary>
    /// Token opaco de 32 bytes, en base64 seguro para URL.
    ///
    /// Aleatorio criptográfico y no un GUID: un GUID es predecible en parte
    /// y esto viaja como credencial de un solo uso.
    /// </summary>
    public static string GenerarToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');

    /// <summary>
    /// Marca al usuario como pendiente y le envía el enlace.
    ///
    /// Devuelve <c>false</c> si el correo no pudo salir. La cuenta igual queda
    /// creada y pendiente: una caida del proveedor de correo no puede impedir
    /// que alguien se registre, y el enlace se puede volver a pedir.
    ///
    /// Si no hay SMTP configurado, el usuario se da por verificado: sin correo
    /// no habría forma de completar el alta y la cuenta quedaría inaccesible
    /// para siempre.
    /// </summary>
    public static async Task<bool> PrepararYEnviarAsync(
        Usuario usuario,
        IServicioCorreo correo,
        string urlBase,
        CancellationToken ct)
    {
        if (!correo.Configurado)
        {
            usuario.EmailVerificado = true;
            usuario.TokenVerificacion = null;
            usuario.TokenVerificacionExpira = null;
            return true;
        }

        usuario.EmailVerificado = false;
        usuario.TokenVerificacion = GenerarToken();
        usuario.TokenVerificacionExpira = DateTime.UtcNow.Add(Vigencia);

        var enlace = $"{urlBase.TrimEnd('/')}/verificar?token={usuario.TokenVerificacion}";

        try
        {
            await correo.EnviarAsync(
                usuario.Email,
                "Confirmá tu correo en NutriSoftware",
            $"""
             <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#1f2d24">
               <h2 style="color:#0D9F63;margin:0 0 16px">Bienvenido a NutriSoftware</h2>
               <p style="line-height:1.6">Para activar tu cuenta confirmá que este correo es tuyo:</p>
               <p style="margin:28px 0">
                 <a href="{enlace}"
                    style="background:#0D9F63;color:#fff;padding:12px 24px;border-radius:10px;
                           text-decoration:none;font-weight:600;display:inline-block">
                   Confirmar mi correo
                 </a>
               </p>
               <p style="line-height:1.6;font-size:13px;color:#5b6b61">
                 El enlace vence en 24 horas. Si no funciona, copiá esta dirección en tu navegador:<br>
                 <span style="word-break:break-all">{enlace}</span>
               </p>
               <p style="line-height:1.6;font-size:13px;color:#5b6b61">
                 Si no creaste ninguna cuenta, ignorá este mensaje.
               </p>
             </div>
             """,
                ct);
        }
        catch (Exception)
        {
            // El token queda guardado, asi que "reenviar" sirve para
            // recuperarse. Propagar tumbaria el registro entero.
            return false;
        }

        return true;
    }
}
