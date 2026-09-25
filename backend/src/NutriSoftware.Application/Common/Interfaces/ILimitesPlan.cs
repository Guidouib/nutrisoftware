namespace NutriSoftware.Application.Common.Interfaces;

/// <summary>
/// Topes del plan del nutricionista.
///
/// Es una interfaz y no una lectura directa de la configuración porque la
/// capa Application no conoce infraestructura: igual que <c>IJwtService</c> o
/// <c>IGeneradorPdf</c>, se declara acá y se implementa en Infrastructure.
/// </summary>
public interface ILimitesPlan
{
    /// <summary>Pacientes activos permitidos por nutricionista.</summary>
    int MaxPacientes { get; }
}
