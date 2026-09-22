import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { seguimientoService } from '../services/seguimientoService'
import { calcularImc } from '../lib/antropometria'
import type {
  ControlSeguimiento,
  MetaPaciente,
  PeriodoSeguimiento,
} from '../types/seguimiento'
import { PERIODOS } from '../types/seguimiento'

export function useControles(pacienteId: string | undefined) {
  return useQuery<ControlSeguimiento[]>({
    queryKey: ['seguimiento', pacienteId],
    queryFn: () => seguimientoService.listar(pacienteId!),
    enabled: Boolean(pacienteId),
  })
}

export function useCrearControl(pacienteId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (control: Omit<ControlSeguimiento, 'id'>) => seguimientoService.crear(control),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['seguimiento', pacienteId] })
    },
  })
}

export function useMeta(pacienteId: string | undefined) {
  return useQuery<MetaPaciente>({
    queryKey: ['meta', pacienteId],
    queryFn: () => seguimientoService.obtenerMeta(pacienteId!),
    enabled: Boolean(pacienteId),
  })
}

export function useGuardarMeta(pacienteId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (meta: MetaPaciente) => seguimientoService.guardarMeta(meta),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['meta', pacienteId] })
    },
  })
}

/* ── Derivados para gráficos y resumen ───────────────────────── */

export interface PuntoEvolucion {
  fecha: string
  etiqueta: string
  peso: number
  imc: number | null
  cumplimiento: number
  perimetroAbdominal?: number
  perimetroCintura?: number
  perimetroCadera?: number
  perimetroBrazo?: number
}

export interface ResumenProgreso {
  pesoInicial: number | null
  pesoActual: number | null
  pesoObjetivo: number | null
  /** % de avance del trayecto inicial → objetivo, acotado a 0–100. */
  avance: number | null
  diferencia: number | null
  semanasEnTratamiento: number
}

function etiquetaCorta(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

function dentroDelPeriodo(fecha: string, periodo: PeriodoSeguimiento): boolean {
  const meses = PERIODOS.find(p => p.valor === periodo)?.meses
  if (meses === null || meses === undefined) return true
  const limite = new Date()
  limite.setMonth(limite.getMonth() - meses)
  return new Date(fecha) >= limite
}

/**
 * Serie cronológica (más antigua primero) filtrada por período, lista para
 * Recharts. La talla se arrastra del control más reciente que la registró,
 * porque no se mide en cada consulta pero hace falta para el IMC.
 */
export function useEvolucion(
  controles: ControlSeguimiento[],
  periodo: PeriodoSeguimiento,
  tallaPorDefecto: number | null
): PuntoEvolucion[] {
  return useMemo(() => {
    const puntos: PuntoEvolucion[] = []
    let ultimaTalla = tallaPorDefecto

    // Bucle explícito en vez de `.map`: la talla se arrastra entre iteraciones.
    for (const c of [...controles].reverse()) {
      if (c.talla) ultimaTalla = c.talla
      if (!dentroDelPeriodo(c.fecha, periodo)) continue
      puntos.push({
        fecha: c.fecha,
        etiqueta: etiquetaCorta(c.fecha),
        peso: c.peso,
        imc: calcularImc(c.peso, ultimaTalla),
        cumplimiento: c.cumplimiento,
        ...c.medidas,
      })
    }

    return puntos
  }, [controles, periodo, tallaPorDefecto])
}

export function useResumenProgreso(
  controles: ControlSeguimiento[],
  pesoObjetivo: number | null
): ResumenProgreso {
  return useMemo(() => {
    if (controles.length === 0) {
      return {
        pesoInicial: null,
        pesoActual: null,
        pesoObjetivo,
        avance: null,
        diferencia: null,
        semanasEnTratamiento: 0,
      }
    }

    const actual = controles[0]
    const inicial = controles[controles.length - 1]

    const trayecto = pesoObjetivo !== null ? inicial.peso - pesoObjetivo : null
    const recorrido = pesoObjetivo !== null ? inicial.peso - actual.peso : null
    const avance =
      trayecto !== null && recorrido !== null && trayecto !== 0
        ? Math.max(0, Math.min(100, Math.round((recorrido / trayecto) * 100)))
        : null

    const dias = Math.max(
      0,
      (new Date(actual.fecha).getTime() - new Date(inicial.fecha).getTime()) / 86_400_000
    )

    return {
      pesoInicial: inicial.peso,
      pesoActual: actual.peso,
      pesoObjetivo,
      avance,
      diferencia: Math.round((actual.peso - inicial.peso) * 10) / 10,
      semanasEnTratamiento: Math.floor(dias / 7),
    }
  }, [controles, pesoObjetivo])
}

/** Promedio de adherencia agrupado por semana ISO, para el gráfico de barras. */
export interface AdherenciaSemana {
  semana: string
  promedio: number
  controles: number
}

export function useAdherencia(puntos: PuntoEvolucion[]): AdherenciaSemana[] {
  return useMemo(() => {
    const grupos = new Map<string, number[]>()

    for (const p of puntos) {
      const d = new Date(p.fecha)
      if (Number.isNaN(d.getTime())) continue
      // Lunes de la semana del control como clave del grupo.
      const lunes = new Date(d)
      lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      const clave = lunes.toISOString().slice(0, 10)
      grupos.set(clave, [...(grupos.get(clave) ?? []), p.cumplimiento])
    }

    return [...grupos.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([clave, valores]) => ({
        semana: etiquetaCorta(clave),
        // Cumplimiento 1-5 expresado como % para leerlo junto a las metas.
        promedio: Math.round((valores.reduce((s, v) => s + v, 0) / valores.length / 5) * 100),
        controles: valores.length,
      }))
  }, [puntos])
}
