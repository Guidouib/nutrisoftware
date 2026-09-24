namespace NutriSoftware.Application.Common;

/// <summary>
/// Reglas mínimas de contraseña, validadas en el servidor.
///
/// Antes vivían solo en el esquema de zod del frontend: quien le pegara al
/// API directo podía registrarse con una contraseña de un carácter. La
/// validación del navegador es comodidad para el usuario, no un control.
/// </summary>
public static class PoliticaContrasena
{
    public const int LargoMinimo = 8;

    /// <summary>
    /// Devuelve el motivo del rechazo, o <c>null</c> si la contraseña sirve.
    /// El texto se le muestra al usuario, así que dice qué falta.
    /// </summary>
    public static string? Validar(string? contrasena)
    {
        if (string.IsNullOrWhiteSpace(contrasena))
            return "La contraseña es obligatoria.";

        if (contrasena.Length < LargoMinimo)
            return $"La contraseña debe tener al menos {LargoMinimo} caracteres.";

        if (!contrasena.Any(char.IsUpper))
            return "La contraseña debe incluir al menos una mayúscula.";

        if (!contrasena.Any(char.IsDigit))
            return "La contraseña debe incluir al menos un número.";

        return null;
    }
}
