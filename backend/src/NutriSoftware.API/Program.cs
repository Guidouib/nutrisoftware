using System.Text;
using System.Threading.RateLimiting;
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

// Este secreto estuvo commiteado en appsettings.json de un repositorio
// publico, asi que hay que darlo por comprometido para siempre: sigue en el
// historial de git y cualquiera puede firmar tokens validos con el. Ya no
// esta en el arbol de trabajo, pero lo rechazamos por nombre para que no
// vuelva por copiar y pegar de un commit viejo.
const string SecretoComprometido = "NutriSoftware_JWT_Secret_Key_2026_MustBe32CharsMin!";
var jwtSecret = builder.Configuration["Jwt:Secret"];

// El comprometido se rechaza en cualquier entorno, tambien en desarrollo:
// no hay razon para seguir usandolo ni siquiera en local.
if (jwtSecret == SecretoComprometido)
{
    throw new InvalidOperationException(
        "Jwt:Secret es el secreto que quedo expuesto en el historial publico del repositorio. " +
        "Genera uno nuevo y ponelo en appsettings.Development.json (local) o en Jwt__Secret (produccion).");
}

if (!builder.Environment.IsDevelopment() && string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "Jwt__Secret no esta definido. Genera uno de 32+ caracteres y cargalo " +
        "como variable de entorno antes de desplegar. Ver DEPLOY.md.");
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

// Limite de intentos sobre /api/auth: sin esto el login admite fuerza bruta
// ilimitada contra cualquier cuenta. La ventana es por IP.
builder.Services.AddRateLimiter(opt =>
{
    opt.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    opt.AddPolicy("Autenticacion", contexto =>
        RateLimitPartition.GetFixedWindowLimiter(
            // Se prefiere la IP real cuando hay proxy delante (Netlify, Render):
            // sin esto todas las peticiones compartirian la IP del proxy y un
            // solo atacante agotaria el cupo de todos.
            partitionKey: contexto.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                ?.Split(',')[0].Trim()
                ?? contexto.Connection.RemoteIpAddress?.ToString()
                ?? "desconocida",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

builder.Services.AddScoped<SuscripcionFilter>();
builder.Services.AddControllers(opt =>
{
    // Global: alcanza a todos los controladores y el propio filtro exceptua
    // los de autenticacion. Ponerlo por atributo obligaria a recordar
    // agregarlo en cada controlador nuevo.
    opt.Filters.Add<SuscripcionFilter>();
});
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

app.UseRateLimiter();
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ruta sin autenticar para el health check de la plataforma (Render).
app.MapGet("/health", () => Results.Ok(new { estado = "ok", fecha = DateTime.UtcNow }))
   .AllowAnonymous();

app.Run();
