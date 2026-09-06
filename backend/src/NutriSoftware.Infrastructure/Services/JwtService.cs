using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Infrastructure.Services;

public class JwtService(IConfiguration config) : IJwtService
{
    public string GenerarAccessToken(Usuario usuario)
    {
        var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
        var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Email),
            new(ClaimTypes.Role, usuario.Rol.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        if (usuario.Nutricionista is not null)
            claims.Add(new Claim("nutricionista_id", usuario.Nutricionista.Id.ToString()));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credenciales
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerarRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public Guid? ObtenerUsuarioIdDesdeToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        var sub = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
        return sub is not null && Guid.TryParse(sub, out var id) ? id : null;
    }
}
