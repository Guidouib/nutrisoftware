/**
 * Lógica del semáforo clínico.
 *
 * Vive fuera de `SemaforoBadge.tsx` porque un archivo de componentes que
 * además exporta funciones rompe el Fast Refresh de React.
 */

/** `neutro` significa "sin dato para clasificar", no un cuarto nivel de riesgo. */
export type NivelSemaforo = 'optimo' | 'precaucion' | 'critico' | 'neutro'

/** Rango de referencia `[min, max]`. `null` en un extremo = sin límite por ese lado. */
export type Rango = [number | null, number | null]

function dentro(valor: number, [min, max]: Rango): boolean {
  return (min === null || valor >= min) && (max === null || valor <= max)
}

/**
 * Clasifica un valor contra un rango óptimo y un rango tolerado más amplio.
 * Fuera del tolerado (o sin tolerado definido) → `critico`.
 */
export function nivelPorRango(
  valor: number | null | undefined,
  optimo: Rango,
  tolerado?: Rango
): NivelSemaforo {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return 'neutro'
  if (dentro(valor, optimo)) return 'optimo'
  if (tolerado && dentro(valor, tolerado)) return 'precaucion'
  return 'critico'
}

/** Cobertura de un macronutriente: 90–110 % verde, 80–120 % ámbar. */
export function nivelPorCobertura(porcentaje: number): NivelSemaforo {
  return nivelPorRango(porcentaje, [90, 110], [80, 120])
}
