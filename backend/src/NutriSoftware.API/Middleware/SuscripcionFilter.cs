using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.API.Middleware;

/// <summary>
/// Corta el acceso cuando la suscripción venció o está suspendida.
///
/// Se aplica a todos los controladores salvo los de autenticación: si también
/// los alcanzara, un nutricionista vencido no podría ni iniciar sesión para
/// enterarse del motivo.
///
/// Devuelve 402 (Payment Required) y no 403, para que el frontend distinga
/// «tenés que pagar» de «no tenés permiso» y muestre la pantalla adecuada.
/// </summary>
public class SuscripcionFilter(ApplicationDbContext db) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(
        ActionExecutingContext contexto, ActionExecutionDelegate siguiente)
    {
        var controlador = contexto.RouteData.Values["controller"]?.ToString();

        // Auth queda afuera: es la puerta de entrada y el único lugar donde
        // el usuario puede llegar a leer por qué está bloqueado.
        if (string.Equals(controlador, "Auth", StringComparison.OrdinalIgnoreCase))
        {
            await siguiente();
            return;
        }

        var claim = contexto.HttpContext.User.FindFirstValue("nutricionista_id");

        // Sin claim no hay suscripción que revisar: o no está autenticado
        // —de eso se encarga [Authorize]— o es un rol sin nutricionista.
        if (!Guid.TryParse(claim, out var nutricionistaId))
        {
            await siguiente();
            return;
        }

        var nutricionista = await db.Nutricionistas
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == nutricionistaId, contexto.HttpContext.RequestAborted);

        if (nutricionista is null)
        {
            await siguiente();
            return;
        }

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var estado = Suscripcion.Estado(nutricionista, hoy);

        if (Suscripcion.PermiteAcceso(estado))
        {
            await siguiente();
            return;
        }

        contexto.Result = new ObjectResult(new
        {
            error = estado == EstadoSuscripcion.Suspendida
                ? "Tu cuenta está suspendida. Escribinos para reactivarla."
                : "Tu suscripción venció. Renovala para seguir usando NutriSoftware.",
            estadoSuscripcion = estado.ToString(),
            venceEl = nutricionista.SuscripcionHasta,
        })
        {
            StatusCode = StatusCodes.Status402PaymentRequired,
        };
    }
}
