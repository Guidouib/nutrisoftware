import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dietaService } from '../services/dietaService'
import { dietaVacia } from '../lib/dieta'
import type { Dieta } from '../types/dieta'
import type { RequerimientosPaciente } from '../types/evaluacion'

const RETARDO_AUTOGUARDADO_MS = 2000

export function useDietasDePaciente(pacienteId: string | undefined) {
  return useQuery<Dieta[]>({
    queryKey: ['dietas', pacienteId],
    queryFn: () => dietaService.listar(pacienteId!),
    enabled: Boolean(pacienteId),
  })
}

export type EstadoAutoguardado = 'inactivo' | 'pendiente' | 'guardando' | 'guardado' | 'error'

interface UseDietaResultado {
  dieta: Dieta | null
  /** Actualiza en memoria y programa el autoguardado. */
  actualizar: (cambio: (actual: Dieta) => Dieta) => void
  cargando: boolean
  estadoGuardado: EstadoAutoguardado
  guardarAhora: () => void
}

/**
 * Carga la dieta (existente o nueva en memoria), mantiene el borrador y lo
 * persiste con debounce de 2 s. El temporizador se reinicia con cada cambio y
 * se descarga al desmontar para no perder la última edición.
 */
export function useDieta(
  pacienteId: string | undefined,
  dietaId: string | undefined,
  requerimientos: RequerimientosPaciente | null
): UseDietaResultado {
  const qc = useQueryClient()
  const esNueva = !dietaId || dietaId === 'nueva'

  const { data: existente, isLoading } = useQuery<Dieta | null>({
    queryKey: ['dieta', pacienteId, dietaId],
    queryFn: () => dietaService.obtener(pacienteId!, dietaId!),
    enabled: Boolean(pacienteId) && !esNueva,
  })

  const [borrador, setBorrador] = useState<Dieta | null>(null)
  const [estadoGuardado, setEstado] = useState<EstadoAutoguardado>('inactivo')

  // Punto de partida: la dieta del servidor, o una nueva en blanco. Se deriva
  // en vez de sembrarse con un efecto, así no hay setState en render.
  const base = useMemo<Dieta | null>(() => {
    if (!esNueva) return existente ?? null
    if (!pacienteId || !requerimientos) return null
    return dietaVacia(pacienteId, requerimientos)
  }, [esNueva, existente, pacienteId, requerimientos])

  const dieta = borrador ?? base

  const { mutate: persistir } = useMutation({
    mutationFn: (d: Dieta) => dietaService.guardar(d),
    onSuccess: () => {
      setEstado('guardado')
      void qc.invalidateQueries({ queryKey: ['dietas', pacienteId] })
    },
    onError: () => setEstado('error'),
  })

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendiente = useRef<Dieta | null>(null)

  const programarGuardado = useCallback(
    (siguiente: Dieta) => {
      pendiente.current = siguiente
      setEstado('pendiente')
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => {
        temporizador.current = null
        const aGuardar = pendiente.current
        pendiente.current = null
        if (!aGuardar) return
        setEstado('guardando')
        persistir(aGuardar)
      }, RETARDO_AUTOGUARDADO_MS)
    },
    [persistir]
  )

  const actualizar = useCallback(
    (cambio: (actual: Dieta) => Dieta) => {
      if (!dieta) return
      const siguiente = cambio(dieta)
      setBorrador(siguiente)
      programarGuardado(siguiente)
    },
    [dieta, programarGuardado]
  )

  const guardarAhora = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current)
      temporizador.current = null
    }
    const aGuardar = pendiente.current ?? dieta
    pendiente.current = null
    if (!aGuardar) return
    setEstado('guardando')
    persistir(aGuardar)
  }, [dieta, persistir])

  // Al desmontar, descarga lo que quedó en el debounce.
  useEffect(() => {
    return () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current)
        temporizador.current = null
      }
      const aGuardar = pendiente.current
      pendiente.current = null
      if (aGuardar) persistir(aGuardar)
    }
  }, [persistir])

  return { dieta, actualizar, cargando: isLoading && !esNueva, estadoGuardado, guardarAhora }
}
