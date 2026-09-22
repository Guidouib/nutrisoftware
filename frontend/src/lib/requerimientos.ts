import type { EstadioTanner, RequerimientosPaciente, Sexo } from '../types/evaluacion'

/* ═══════════════════════════════════════════════════════════════
   REQUERIMIENTO ENERGÉTICO Y DISTRIBUCIÓN DE MACRONUTRIENTES
   ═══════════════════════════════════════════════════════════════ */

export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muyActivo'

export const NIVELES_ACTIVIDAD: { valor: NivelActividad; titulo: string; factor: number; detalle: string }[] = [
  { valor: 'sedentario', titulo: 'Sedentario',   factor: 1.2,   detalle: 'Sin ejercicio, trabajo de escritorio' },
  { valor: 'ligero',     titulo: 'Ligero',       factor: 1.375, detalle: 'Ejercicio ligero 1–3 días/semana' },
  { valor: 'moderado',   titulo: 'Moderado',     factor: 1.55,  detalle: 'Ejercicio moderado 3–5 días/semana' },
  { valor: 'activo',     titulo: 'Activo',       factor: 1.725, detalle: 'Ejercicio intenso 6–7 días/semana' },
  { valor: 'muyActivo',  titulo: 'Muy activo',   factor: 1.9,   detalle: 'Trabajo físico o doble sesión diaria' },
]

export function factorActividad(nivel: NivelActividad): number {
  return NIVELES_ACTIVIDAD.find(n => n.valor === nivel)?.factor ?? 1.2
}

/** Tasa metabólica basal — Mifflin-St Jeor (1990). */
export function tmbMifflinStJeor(pesoKg: number, tallaCm: number, edad: number, sexo: Sexo): number {
  const base = 10 * pesoKg + 6.25 * tallaCm - 5 * edad
  return Math.round(sexo === 'M' ? base + 5 : base - 161)
}

/** Gasto energético total = TMB × factor de actividad. */
export function gastoEnergeticoTotal(
  pesoKg: number,
  tallaCm: number,
  edad: number,
  sexo: Sexo,
  nivel: NivelActividad
): number {
  return Math.round(tmbMifflinStJeor(pesoKg, tallaCm, edad, sexo) * factorActividad(nivel))
}

/* ── Macronutrientes ──────────────────────────────────────────── */

export const KCAL_POR_GRAMO = { proteinas: 4, carbohidratos: 4, grasas: 9 } as const

export interface DistribucionMacros {
  proteinas: number
  carbohidratos: number
  grasas: number
}

/** Distribución de referencia habitual en consulta ambulatoria. */
export const DISTRIBUCION_POR_DEFECTO: DistribucionMacros = {
  proteinas: 20,
  carbohidratos: 50,
  grasas: 30,
}

/** Convierte kcal + reparto porcentual en gramos por macronutriente. */
export function macrosEnGramos(kcal: number, dist: DistribucionMacros): RequerimientosPaciente {
  return {
    kcal,
    proteinasG: Math.round((kcal * dist.proteinas) / 100 / KCAL_POR_GRAMO.proteinas),
    carbohidratosG: Math.round((kcal * dist.carbohidratos) / 100 / KCAL_POR_GRAMO.carbohidratos),
    grasasG: Math.round((kcal * dist.grasas) / 100 / KCAL_POR_GRAMO.grasas),
  }
}

/**
 * Ajusta el reparto tras mover un slider: el resto se reparte entre los otros
 * dos macros conservando su proporción relativa, de modo que la suma siga en 100 %.
 */
export function ajustarDistribucion(
  actual: DistribucionMacros,
  macro: keyof DistribucionMacros,
  valor: number
): DistribucionMacros {
  const nuevo = Math.max(0, Math.min(100, Math.round(valor)))
  const otros = (Object.keys(actual) as (keyof DistribucionMacros)[]).filter(k => k !== macro)
  const restante = 100 - nuevo
  const sumaOtros = otros.reduce((s, k) => s + actual[k], 0)

  const resultado = { ...actual, [macro]: nuevo } as DistribucionMacros

  if (sumaOtros === 0) {
    // Sin proporción previa: se reparte en partes iguales.
    resultado[otros[0]] = Math.round(restante / 2)
    resultado[otros[1]] = restante - resultado[otros[0]]
    return resultado
  }

  resultado[otros[0]] = Math.round((actual[otros[0]] / sumaOtros) * restante)
  resultado[otros[1]] = restante - resultado[otros[0]]
  return resultado
}

/* ── Adolescentes: requerimiento por etapa puberal ────────────── */

/**
 * kcal/kg y proteína g/kg de referencia por estadio de Tanner.
 * El pico de demanda coincide con el estirón puberal (Tanner III–IV).
 */
const POR_TANNER: Record<EstadioTanner, { kcalPorKg: number; proteinaPorKg: number; etapa: string }> = {
  I:   { kcalPorKg: 55, proteinaPorKg: 1.0, etapa: 'Prepuberal' },
  II:  { kcalPorKg: 55, proteinaPorKg: 1.0, etapa: 'Inicio puberal' },
  III: { kcalPorKg: 60, proteinaPorKg: 1.2, etapa: 'Estirón puberal' },
  IV:  { kcalPorKg: 55, proteinaPorKg: 1.1, etapa: 'Puberal avanzado' },
  V:   { kcalPorKg: 45, proteinaPorKg: 0.9, etapa: 'Madurez completa' },
}

export function requerimientoAdolescente(pesoKg: number, tanner: EstadioTanner) {
  const ref = POR_TANNER[tanner]
  return {
    etapa: ref.etapa,
    kcal: Math.round(pesoKg * ref.kcalPorKg),
    proteinaG: Math.round(pesoKg * ref.proteinaPorKg * 10) / 10,
    kcalPorKg: ref.kcalPorKg,
    proteinaPorKg: ref.proteinaPorKg,
  }
}

/* ── Embarazo: adicional energético por trimestre (OMS/FAO) ──── */

export function adicionalPorTrimestre(trimestre: 1 | 2 | 3): number {
  if (trimestre === 1) return 0
  return trimestre === 2 ? 340 : 452
}

export function trimestreDeSemana(semanas: number): 1 | 2 | 3 {
  if (semanas <= 13) return 1
  return semanas <= 27 ? 2 : 3
}

/* ── Ganancia de peso gestacional — IOM 2009 ─────────────────── */

export interface RangoGanancia {
  categoria: string
  /** Ganancia total recomendada para todo el embarazo (kg). */
  totalMin: number
  totalMax: number
  /** Ritmo semanal en 2.º y 3.er trimestre (kg/semana). */
  semanalMin: number
  semanalMax: number
}

/** Ganancia del primer trimestre, común a todas las categorías (kg). */
const GANANCIA_PRIMER_TRIMESTRE = { min: 0.5, max: 2 }

export function rangoIom(imcPregestacional: number): RangoGanancia {
  if (imcPregestacional < 18.5)
    return { categoria: 'Bajo peso', totalMin: 12.5, totalMax: 18, semanalMin: 0.44, semanalMax: 0.58 }
  if (imcPregestacional < 25)
    return { categoria: 'Peso normal', totalMin: 11.5, totalMax: 16, semanalMin: 0.35, semanalMax: 0.50 }
  if (imcPregestacional < 30)
    return { categoria: 'Sobrepeso', totalMin: 7, totalMax: 11.5, semanalMin: 0.23, semanalMax: 0.33 }
  return { categoria: 'Obesidad', totalMin: 5, totalMax: 9, semanalMin: 0.17, semanalMax: 0.27 }
}

/**
 * Ganancia esperada a la semana `semanas`: la del primer trimestre más el
 * ritmo semanal acumulado desde la semana 13.
 */
export function gananciaEsperada(imcPregestacional: number, semanas: number): { min: number; max: number } {
  const rango = rangoIom(imcPregestacional)
  const redondeo = (n: number) => Math.round(n * 10) / 10

  if (semanas <= 13) {
    const proporcion = semanas / 13
    return {
      min: redondeo(GANANCIA_PRIMER_TRIMESTRE.min * proporcion),
      max: redondeo(GANANCIA_PRIMER_TRIMESTRE.max * proporcion),
    }
  }

  const semanasRestantes = semanas - 13
  return {
    min: redondeo(GANANCIA_PRIMER_TRIMESTRE.min + rango.semanalMin * semanasRestantes),
    max: redondeo(GANANCIA_PRIMER_TRIMESTRE.max + rango.semanalMax * semanasRestantes),
  }
}

/**
 * Altura uterina esperada (cm). Regla de McDonald: entre las semanas 20 y 34
 * la altura en centímetros equivale a las semanas de gestación (± 2 cm).
 * Fuera de esa ventana la regla no aplica y se devuelve `null`.
 */
export function alturaUterinaEsperada(semanas: number): number | null {
  return semanas >= 20 && semanas <= 34 ? semanas : null
}
