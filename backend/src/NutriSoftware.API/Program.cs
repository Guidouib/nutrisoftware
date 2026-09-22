using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NutriSoftware.API.Middleware;
using NutriSoftware.Application;
using NutriSoftware.Infrastructure;
using NutriSoftware.Infrastructure.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// El secreto que viaja en appsettings.json es solo para desarrollo: esta
// commiteado, asi que cualquiera con acceso al repo puede firmar tokens
// validos. En produccion exigimos uno propio por variable de entorno.
const string SecretoDeDesarrollo = "NutriSoftware_JWT_Secret_Key_2026_MustBe32CharsMin!";
var jwtSecret = builder.Configuration["Jwt:Secret"];

if (!builder.Environment.IsDevelopment() &&
    (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret == SecretoDeDesarrollo))
{
    throw new InvalidOperationException(
        "Jwt__Secret no esta definido o sigue siendo el de desarrollo. " +
        "Genera uno de 32+ caracteres y cargalo como variable de entorno antes de desplegar.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "NutriSoftware API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            []
        }
    });
});

// Netlify hace de proxy inverso hacia /api, asi que el navegador ve un solo
// origen y no dispara preflight. Igual dejamos la lista configurable —
// separada por comas— para pegarle al API directo desde otro dominio.
var origenes = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("Frontend", policy =>
        policy.WithOrigins(origenes)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// En la demo publica Swagger sirve de recorrido por la API; se apaga poniendo
// HabilitarSwagger=false.
if (app.Environment.IsDevelopment() || app.Configuration.GetValue("HabilitarSwagger", false))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Aplica las migraciones pendientes antes de sembrar. Sin esto, contra una
    // base recien creada el seed explota con 42P01 (la tabla no existe) porque
    // su primera sentencia ya consulta Alimentos.
    await db.Database.MigrateAsync();

    // SembrarDatosDemo=true crea la cuenta demo y pacientes ficticios. Sin
    // esto una base nueva no tiene ningun usuario con el que iniciar sesion.
    await DbInitializer.SeedAsync(db, app.Configuration.GetValue("SembrarDatosDemo", false));
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Koyeb necesita una ruta sin autenticar para los health checks.
app.MapGet("/health", () => Results.Ok(new { estado = "ok", fecha = DateTime.UtcNow }))
   .AllowAnonymous();

app.Run();
