using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Queda en false hasta que el usuario abre el enlace que se le envía por
    /// correo. Sin verificar no se puede iniciar sesión.
    ///
    /// Las cuentas creadas antes de esta comprobación se dan por verificadas
    /// en la migración: nadie les mandó nunca un correo y dejarlas afuera las
    /// habría bloqueado.
    /// </summary>
    public bool EmailVerificado { get; set; }

    public string? TokenVerificacion { get; set; }
    public DateTime? TokenVerificacionExpira { get; set; }

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Nutricionista? Nutricionista { get; set; }
    public Paciente? Paciente { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
