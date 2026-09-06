namespace NutriSoftware.Application.DTOs.Pacientes;

public record PacienteDto(
    Guid Id,
    string Nombres,
    string Apellidos,
    string NombreCompleto,
    DateOnly FechaNacimiento,
    int Edad,
    string Sexo,
    string? Email,
    string? Telefono,
    string? Dni,
    string? Direccion,
    string? FotoUrl,
    string? Notas,
    bool Activo,
    DateTime FechaCreacion,
    DateTime? UltimaCita
);
