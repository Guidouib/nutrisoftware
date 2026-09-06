using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Nutricionista? Nutricionista { get; set; }
    public Paciente? Paciente { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
