import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { consumoService } from '../services/consumoService'
import { calcularTotales, hoyIso } from '../lib/consumo'
import type {
  GuardarRegistroConsumoRequest,
  ItemConsumo,
  RegistroConsumo,
  RegistroConsumoResumen,
} from '../types/consumo'

const RETARDO_AUTOGUARDADO_MS = 2000

export function useRegistrosDePaciente(pacienteId: string | undefined) {
  return useQuery<RegistroConsumoResumen[]>({
    queryKey: ['consumo', pacienteId],
    queryFn: () => consumoService.listar(pacienteId!),
    enabled: Boolean(pacienteId),
  })
}

export function useEliminarRegistro(pacienteId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (registroId: string) => consumoService.eliminar(registroId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consumo', pacienteId] })
    },
  })
}

export type EstadoAutoguardado = 'inactivo' | 'pendiente' | 'guardando' | 'guardado' | 'error'

/** Borrador en memoria: los items todavía no tienen id del servidor. */
export interface BorradorConsumo {
  fecha: string
  titulo: string
  observaciones: string
  items: ItemConsumo[]
}

function borradorVacio(): BorradorConsumo {
  return { fecha: hoyIso(), titulo: 'Recordatorio 24 h', observaciones: '', items: [] }
}

interface UseRecordatorioResultado {
  borrador: BorradorConsumo
  actualizar: (cambio: (actual: BorradorConsumo) => BorradorConsumo) => void
  cargando: boolean
  estadoGuardado: EstadoAutoguardado
  guardarAhora: () => void
  errorGuardado: string | null
}

/**
 * Mantiene el recordatorio en memoria y lo persiste con debounce de 2 s,
 * igual que el constructor de dietas.
 *
 * El Excel guardaba el libro entero en cada alimento agregado: con una hoja
 * de 2 MB eso costaba segundos por alimento y además borraba el deshacer.
 * Acá la escritura se agrupa y el usuario sigue cargando sin esperar.
 */
export function useRecordatorio(
  pacienteId: string | undefined,
  registroId: string
): UseRecordatorioResultado {
  const qc = useQueryClient()

  // Siempre se consulta: el id lo genera la pantalla antes de guardar, así
  // que un 404 significa "recordatorio nuevo" y el servicio lo traduce a
  // null en vez de a un error.
  const { data: existente, isLoading } = useQuery<RegistroConsumo | null>({
    queryKey: ['consumo-registro', registroId],
    queryFn: () => consumoService.obtener(registroId),
    // Sin reintentos: un 404 acá es la respuesta esperada, no un fallo.
    retry: false,
  })

  const [borrador, setBorrador] = useState<BorradorConsumo>(borradorVacio)
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoAutoguardado>('inactivo')
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  const temporizador = useRef<number | null>(null)
  const pendiente = useRef<BorradorConsumo | null>(null)
  const hidratado = useRef(false)

  // Hidrata una sola vez: después manda el borrador local, si no cada
  // respuesta del autoguardado pisaría lo que el usuario está escribiendo.
  useEffect(() => {
    if (!existente || hidratado.current) return
    hidratado.current = true
    setBorrador({
      fecha: existente.fecha,
      titulo: existente.titulo,
      observaciones: existente.observaciones ?? '',
      items: existente.items,
    })
  }, [existente])

  const persistir = useCallback(
    async (estado: BorradorConsumo) => {
      if (!pacienteId) return

      setEstadoGuardado('guardando')
      const cuerpo: GuardarRegistroConsumoRequest = {
        pacienteId,
        fecha: estado.fecha,
        titulo: estado.titulo,
        observaciones: estado.observaciones.trim() || null,
        items: estado.items.map((item, indice) => ({
          tiempoComida: item.tiempoComida,
          orden: indice,
          alimentoId: item.alimentoId,
          nombreAlimento: item.nombreAlimento,
          gramos: item.gramos,
          origenAlimento: item.origenAlimento,
          composicion: item.composicion,
        })),
      }

      try {
        await consumoService.guardar(registroId, cuerpo)
        setEstadoGuardado('guardado')
        setErrorGuardado(null)
        qc.invalidateQueries({ queryKey: ['consumo', pacienteId] })
      } catch (error) {
        setEstadoGuardado('error')
        const mensaje =
          (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        setErrorGuardado(mensaje ?? 'No se pudo guardar el recordatorio.')
      }
    },
    [pacienteId, registroId, qc]
  )

  const programar = useCallback(
    (estado: BorradorConsumo) => {
      pendiente.current = estado
      setEstadoGuardado('pendiente')

      if (temporizador.current) window.clearTimeout(temporizador.current)
      temporizador.current = window.setTimeout(() => {
        temporizador.current = null
        const aGuardar = pendiente.current
        pendiente.current = null
        if (aGuardar) void persistir(aGuardar)
      }, RETARDO_AUTOGUARDADO_MS)
    },
    [persistir]
  )

  const actualizar = useCallback(
    (cambio: (actual: BorradorConsumo) => BorradorConsumo) => {
      setBorrador(actual => {
        const siguiente = cambio(actual)
        programar(siguiente)
        return siguiente
      })
    },
    [programar]
  )

  const guardarAhora = useCallback(() => {
    if (temporizador.current) {
      window.clearTimeout(temporizador.current)
      temporizador.current = null
    }
    pendiente.current = null
    void persistir(borrador)
  }, [borrador, persistir])

  // Descarga lo pendiente al desmontar para no perder la última edición.
  useEffect(
    () => () => {
      if (temporizador.current) {
        window.clearTimeout(temporizador.current)
        if (pendiente.current) void persistir(pendiente.current)
      }
    },
    [persistir]
  )

  return {
    borrador,
    actualizar,
    cargando: isLoading,
    estadoGuardado,
    guardarAhora,
    errorGuardado,
  }
}

/** Totales del borrador, recalculados en el cliente para respuesta inmediata. */
export function useTotales(items: ItemConsumo[]) {
  return calcularTotales(items)
}
