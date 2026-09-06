namespace NutriSoftware.Application.DTOs.Pacientes;

public record CrearPacienteRequest(
    string Nombres,
    string Apellidos,
    DateOnly FechaNacimiento,
    string Sexo,
    string? Email,
    string? Telefono,
    string? Dni,
    string? Direccion,
    string? FotoUrl,
    string? Notas
);

public record ActualizarPacienteRequest(
    string Nombres,
    string Apellidos,
    DateOnly FechaNacimiento,
    string Sexo,
    string? Email,
    string? Telefono,
    string? Dni,
    string? Direccion,
    string? FotoUrl,
    string? Notas
);
