import type { FuenteAlimento } from './alimento'
import type { RequerimientosPaciente } from './evaluacion'

/** 0 = lunes … 6 = domingo. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Alimento asignado a un tiempo de comida.
 * Los valores nutricionales se guardan **por 100 g** junto al ítem para que
 * los totales se recalculen al instante al mover la cantidad, sin volver a
 * consultar la base de alimentos.
 */
export interface AlimentoEnDieta {
  id: string
  alimentoId: string
  nombre: string
  fuente: FuenteAlimento
  gramos: number
  energia100: number
  proteinas100: number
  grasas100: number
  carbohidratos100: number
  fibra100: number
}

export interface NutrientesCalculados {
  energia: number
  proteinas: number
  grasas: number
  carbohidratos: number
  fibra: number
}

export interface TiempoComidaDieta {
  id: string
  nombre: string
  alimentos: AlimentoEnDieta[]
}

export interface DiaDietaDetalle {
  diaSemana: DiaSemana
  tiempos: TiempoComidaDieta[]
}

export interface Dieta {
  id: string
  pacienteId: string
  fecha: string
  nombre: string
  requerimientos: RequerimientosPaciente
  dias: DiaDietaDetalle[]
  modoIntercambios: boolean
}

export type EstadoDia = 'vacio' | 'incompleto' | 'completo'
