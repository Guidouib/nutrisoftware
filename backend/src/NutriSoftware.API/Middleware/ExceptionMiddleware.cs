using System.Text.Json;

namespace NutriSoftware.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado: {Message}", ex.Message);
            await ManejarExcepcionAsync(context, ex);
        }
    }

    private static Task ManejarExcepcionAsync(HttpContext context, Exception ex)
    {
        var (status, mensaje) = ex switch
        {
            UnauthorizedAccessException => (401, ex.Message),
            InvalidOperationException => (400, ex.Message),
            KeyNotFoundException => (404, ex.Message),
            _ => (500, "Ocurrió un error interno. Intente nuevamente.")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = status;

        return context.Response.WriteAsync(JsonSerializer.Serialize(new { error = mensaje }));
    }
}
