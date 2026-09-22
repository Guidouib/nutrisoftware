export interface MedidasControl {
  perimetroAbdominal?: number
  perimetroCintura?: number
  perimetroCadera?: number
  perimetroBrazo?: number
}

export interface ControlSeguimiento {
  id: string
  pacienteId: string
  fecha: string
  peso: number
  talla?: number
  medidas: MedidasControl
  /** Adherencia declarada al plan, de 1 (nula) a 5 (total). */
  cumplimiento: number
  observaciones?: string
}

export interface MetaPaciente {
  pacienteId: string
  pesoObjetivo: number | null
}

export type PeriodoSeguimiento = '1m' | '3m' | '6m' | 'todo'

export const PERIODOS: { valor: PeriodoSeguimiento; titulo: string; meses: number | null }[] = [
  { valor: '1m', titulo: 'Último mes', meses: 1 },
  { valor: '3m', titulo: '3 meses', meses: 3 },
  { valor: '6m', titulo: '6 meses', meses: 6 },
  { valor: 'todo', titulo: 'Todo', meses: null },
]

export const ETIQUETAS_CUMPLIMIENTO: Record<number, string> = {
  1: 'Sin adherencia',
  2: 'Adherencia baja',
  3: 'Adherencia parcial',
  4: 'Buena adherencia',
  5: 'Adherencia total',
}
