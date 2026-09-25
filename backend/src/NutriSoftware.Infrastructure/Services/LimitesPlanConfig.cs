using Microsoft.Extensions.Configuration;
using NutriSoftware.Application.Common.Interfaces;

namespace NutriSoftware.Infrastructure.Services;

/// <summary>
/// Lee los topes del plan desde la configuracion.
///
/// El sidebar mostraba "Plan Starter - 0 de 25 pacientes" con el texto
/// escrito a mano: ni contaba ni limitaba. Ahora el tope se aplica en el
/// servidor y se ajusta con Limites__MaxPacientes sin tocar el codigo.
/// </summary>
public class LimitesPlanConfig(IConfiguration config) : ILimitesPlan
{
    private const int PorDefecto = 50;

    public int MaxPacientes
    {
        get
        {
            // Se lee la clave y se parsea a mano: GetValue<T> vive en
            // Configuration.Binder, que este proyecto no referencia.
            var valor = int.TryParse(config["Limites:MaxPacientes"], out var n) ? n : PorDefecto;
            // Un cero o un negativo por error de configuracion dejaria al
            // nutricionista sin poder crear ningun paciente.
            return valor > 0 ? valor : PorDefecto;
        }
    }
}
