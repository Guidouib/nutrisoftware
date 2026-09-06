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
        services.AddDbContext<ApplicationDbContext>(opt =>
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IPacienteRepository, PacienteRepository>();
        services.AddScoped<ICitaRepository, CitaRepository>();
        services.AddScoped<IAlimentoRepository, AlimentoRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
