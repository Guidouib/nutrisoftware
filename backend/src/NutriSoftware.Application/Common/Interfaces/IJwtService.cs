using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerarAccessToken(Usuario usuario);
    string GenerarRefreshToken();
    Guid? ObtenerUsuarioIdDesdeToken(string token);
}
