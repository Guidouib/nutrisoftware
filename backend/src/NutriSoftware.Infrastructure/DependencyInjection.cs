using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;
using NutriSoftware.Infrastructure.Repositories;
using NutriSoftware.Infrastructure.Services;

namespace NutriSoftware.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // DATABASE_URL va primero a proposito: appsettings.json siempre trae
        // DefaultConnection apuntando al Postgres local, asi que si el orden
        // fuera al reves la variable de entorno nunca se leeria y el deploy
        // terminaria hablandole a un localhost que en el contenedor no existe.
        var cadena = ConnectionStringHelper.Normalizar(
            config["DATABASE_URL"]
            ?? config.GetConnectionString("DefaultConnection"));

        services.AddDbContext<ApplicationDbContext>(opt =>
            opt.UseNpgsql(cadena, npgsql =>
                // Neon corta la conexion cuando el compute se duerme; sin
                // reintentos el primer request tras la siesta devuelve 500.
                npgsql.EnableRetryOnFailure(maxRetryCount: 5,
                                            maxRetryDelay: TimeSpan.FromSeconds(10),
                                            errorCodesToAdd: null)));

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IPacienteRepository, PacienteRepository>();
        services.AddScoped<ICitaRepository, CitaRepository>();
        services.AddScoped<IAlimentoRepository, AlimentoRepository>();
        services.AddScoped<IEvaluacionRepository, EvaluacionRepository>();
        services.AddScoped<IDietaRepository, DietaRepository>();
        services.AddScoped<ISeguimientoRepository, SeguimientoRepository>();
        services.AddScoped<IReporteRepository, ReporteRepository>();
        services.AddScoped<IConsumoRepository, ConsumoRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ILimitesPlan, LimitesPlanConfig>();
        services.AddScoped<IServicioCorreo, ServicioCorreoSmtp>();

        // QuestPDF bajo licencia Community (gratuita para uso comercial hasta
        // el umbral de facturacion que fija su licencia).
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
        // Evita que una fuente sin el glifo exacto aborte la generacion.
        QuestPDF.Settings.CheckIfAllTextGlyphsAreAvailable = false;
        services.AddSingleton<IGeneradorPdf, GeneradorPdfQuestPdf>();

        return services;
    }
}
