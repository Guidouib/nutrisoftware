import type { OrigenAlimento } from '../lib/nutrientes'

/**
 * Composición o aporte, nutriente → valor.
 *
 * `null` significa que la tabla no tiene el dato para ese alimento, que no es
 * lo mismo que cero. Toda la pantalla depende de esa distinción.
 */
export type MapaNutrientes = Record<string, number | null>

export interface ItemConsumo {
  id: string
  tiempoComida: string
  orden: number
  alimentoId: string | null
  nombreAlimento: string
  gramos: number
  origenAlimento: OrigenAlimento
  /** Valores por 100 g, congelados al registrar. */
  composicion: MapaNutrientes
  /** Lo que aporta con los gramos declarados. Lo calcula el servidor. */
  aporte: MapaNutrientes
}

export interface TotalesConsumo {
  valores: Record<string, number>
  /** Cuántos items no tenían dato en cada nutriente. */
  itemsSinDato: Record<string, number>
  totalItems: number
}

export interface RegistroConsumo {
  id: string
  pacienteId: string
  fecha: string
  titulo: string
  observaciones: string | null
  fechaCreacion: string
  fechaActualizacion: string
  items: ItemConsumo[]
  totales: TotalesConsumo
}

export interface RegistroConsumoResumen {
  id: string
  pacienteId: string
  fecha: string
  titulo: string
  cantidadItems: number
  energiaKcal: number
  proteinasG: number
  fechaCreacion: string
}

/* ── Envío ── */

export interface ItemConsumoRequest {
  tiempoComida: string
  orden: number
  alimentoId: string | null
  nombreAlimento: string
  gramos: number
  origenAlimento: OrigenAlimento
  composicion: MapaNutrientes
}

export interface GuardarRegistroConsumoRequest {
  pacienteId: string
  fecha: string
  titulo: string
  observaciones: string | null
  items: ItemConsumoRequest[]
}

/** Tiempos de comida sugeridos; el campo admite cualquier texto. */
export const TIEMPOS_COMIDA = [
  'Desayuno',
  'Media mañana',
  'Almuerzo',
  'Lonche',
  'Cena',
  'Otro',
] as const
