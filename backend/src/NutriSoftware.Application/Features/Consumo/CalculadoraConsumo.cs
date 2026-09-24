using NutriSoftware.Application.DTOs.Consumo;
using NutriSoftware.Domain;

namespace NutriSoftware.Application.Features.Consumo;

/// <summary>
/// Convierte composición por 100 g en aporte real y totaliza un recordatorio.
///
/// El Excel original hacía <c>Val(celda) * gramos / 100</c>, y como
/// <c>Val("•")</c> —el marcador de "sin dato" de la tabla— devuelve 0, sumaba
/// los faltantes como ceros y subestimaba los totales sin avisar. Acá un
/// nutriente sin dato no suma y además se cuenta, para poder decir cuántos
/// alimentos quedaron fuera de cada total.
/// </summary>
public static class CalculadoraConsumo
{
    /// <summary>Aporte de un alimento: composición por 100 g llevada a los gramos declarados.</summary>
    public static Dictionary<string, decimal?> Aporte(
        Dictionary<string, decimal?> composicion, decimal gramos)
    {
        var factor = gramos / 100m;
        var aporte = new Dictionary<string, decimal?>();

        foreach (var n in Nutrientes.Todos)
        {
            aporte[n.Clave] = composicion.TryGetValue(n.Clave, out var v) && v.HasValue
                ? Math.Round(v.Value * factor, n.Decimales)
                : null;
        }

        return aporte;
    }

    /// <summary>
    /// Totaliza los items. Además de los 22 nutrientes de la tabla agrega
    /// hierro hemo y no hemo, que la tabla no trae: se obtienen repartiendo el
    /// hierro de cada alimento según su origen. Esa separación importa porque
    /// la biodisponibilidad del hierro hemo (15-35 %) y la del no hemo
    /// (2-20 %) no son comparables.
    /// </summary>
    public static TotalesConsumoDto Totalizar(IReadOnlyList<ItemConsumoDto> items)
    {
        var valores = new Dictionary<string, decimal>();
        var sinDato = new Dictionary<string, int>();

        foreach (var n in Nutrientes.Todos)
        {
            decimal suma = 0;
            var faltan = 0;

            foreach (var item in items)
            {
                if (item.Aporte.TryGetValue(n.Clave, out var v) && v.HasValue)
                    suma += v.Value;
                else
                    faltan++;
            }

            valores[n.Clave] = Math.Round(suma, n.Decimales);
            sinDato[n.Clave] = faltan;
        }

        decimal hemo = 0, noHemo = 0, mixto = 0;
        var hierroFaltante = 0;

        foreach (var item in items)
        {
            if (!item.Aporte.TryGetValue("hierro", out var fe) || !fe.HasValue)
            {
                hierroFaltante++;
                continue;
            }

            switch (Nutrientes.NormalizarOrigen(item.OrigenAlimento))
            {
                case Nutrientes.OrigenAnimal: hemo += fe.Value; break;
                case Nutrientes.OrigenMixto: mixto += fe.Value; break;
                default: noHemo += fe.Value; break;
            }
        }

        valores[Nutrientes.HierroHemo] = Math.Round(hemo, 2);
        valores[Nutrientes.HierroNoHemo] = Math.Round(noHemo, 2);
        valores[Nutrientes.HierroMixto] = Math.Round(mixto, 2);
        sinDato[Nutrientes.HierroHemo] = hierroFaltante;
        sinDato[Nutrientes.HierroNoHemo] = hierroFaltante;
        sinDato[Nutrientes.HierroMixto] = hierroFaltante;

        return new TotalesConsumoDto(valores, sinDato, items.Count);
    }
}
