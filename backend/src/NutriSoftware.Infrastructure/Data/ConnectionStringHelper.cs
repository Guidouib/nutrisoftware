namespace NutriSoftware.Infrastructure.Data;

/// <summary>
/// Normaliza la cadena de conexion de Postgres.
///
/// Los proveedores gestionados (Neon, Railway, Render, Heroku) entregan la
/// conexion como URL —"postgresql://usuario:clave@host/base?sslmode=require"—
/// pero Npgsql solo entiende el formato clave=valor. Sin esta traduccion el
/// arranque falla con "Format of the initialization string does not conform
/// to specification starting at index 0", que no dice nada sobre la causa.
/// </summary>
public static class ConnectionStringHelper
{
    /// <summary>
    /// Devuelve la cadena en formato Npgsql. Si ya viene en clave=valor la
    /// deja intacta, asi el appsettings local sigue funcionando igual.
    /// </summary>
    public static string Normalizar(string? cadena)
    {
        if (string.IsNullOrWhiteSpace(cadena))
            throw new InvalidOperationException(
                "Falta la cadena de conexion. Defini ConnectionStrings__DefaultConnection " +
                "o DATABASE_URL en las variables de entorno.");

        cadena = cadena.Trim();

        var esUrl = cadena.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
                 || cadena.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

        if (!esUrl)
            return cadena;

        var uri = new Uri(cadena);
        var credenciales = uri.UserInfo.Split(':', 2);

        var usuario = Uri.UnescapeDataString(credenciales[0]);
        var clave = credenciales.Length > 1 ? Uri.UnescapeDataString(credenciales[1]) : string.Empty;
        var baseDatos = uri.AbsolutePath.TrimStart('/');
        var puerto = uri.Port > 0 ? uri.Port : 5432;

        var constructor = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = puerto,
            Username = usuario,
            Password = clave,
            Database = baseDatos,
            // Los gestionados exigen TLS y lo declaran en el query string
            // ("?sslmode=require"). Respetamos lo que venga en la URL y solo
            // caemos a Require cuando no dice nada, porque un Postgres local
            // sin TLS necesita Disable y forzar Require lo dejaria afuera.
            SslMode = LeerSslMode(uri.Query),
            // Neon apaga el compute tras 5 min de inactividad: el primer
            // request despues de dormir necesita margen para reactivarlo.
            Timeout = 30,
            CommandTimeout = 60,
        };

        return constructor.ConnectionString;
    }

    /// <summary>
    /// Traduce el "sslmode" del query string al enum de Npgsql. Ante un valor
    /// ausente o desconocido devuelve Require, que es lo que piden todos los
    /// Postgres gestionados.
    /// </summary>
    private static Npgsql.SslMode LeerSslMode(string query)
    {
        // Parseo a mano en vez de System.Web.HttpUtility: esa clase vive en un
        // ensamblado que no forma parte de un classlib de .NET por defecto.
        var valor = query.TrimStart('?')
            .Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(par => par.Split('=', 2))
            .Where(par => par.Length == 2 && par[0].Equals("sslmode", StringComparison.OrdinalIgnoreCase))
            .Select(par => Uri.UnescapeDataString(par[1]))
            .FirstOrDefault();

        return valor?.ToLowerInvariant() switch
        {
            "disable"     => Npgsql.SslMode.Disable,
            "allow"       => Npgsql.SslMode.Allow,
            "prefer"      => Npgsql.SslMode.Prefer,
            "require"     => Npgsql.SslMode.Require,
            "verify-ca"   => Npgsql.SslMode.VerifyCA,
            "verify-full" => Npgsql.SslMode.VerifyFull,
            _             => Npgsql.SslMode.Require,
        };
    }
}
