namespace NutriSoftware.Application.DTOs.Auth;

/// <summary>
/// Resultado del registro.
///
/// Cuando hay que confirmar el correo NO se entregan credenciales: devolverlas
/// dejaria entrar sin verificar y la comprobacion no serviria de nada. En ese
/// caso <c>Sesion</c> viene en null y la pantalla muestra el aviso.
/// </summary>
public record RegistroResponse(
    bool RequiereVerificacion,
    string Mensaje,
    LoginResponse? Sesion
);
