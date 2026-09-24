import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adolescenteService,
  adultoService,
  antropometriaService,
  bioquimicaService,
  clinicaService,
  embarazadaService,
  ninoService,
} from '../services/evaluacionService'
import { pacientesService } from '../services/pacientesService'
import type { Paciente } from '../types/paciente'
import type { RequerimientosPaciente } from '../types/evaluacion'

/* ── Paciente en contexto ─────────────────────────────────────── */

export function usePaciente(pacienteId: string | undefined) {
  return useQuery<Paciente>({
    queryKey: ['paciente', pacienteId],
    queryFn: () => pacientesService.getById(pacienteId!),
    enabled: Boolean(pacienteId),
  })
}

/* ── Fábrica de hooks por sub-módulo ──────────────────────────── */

interface RegistroPaciente {
  id: string
  pacienteId: string
  fecha: string
}

interface ServicioRecurso<T extends RegistroPaciente> {
  listar(pacienteId: string): Promise<T[]>
  guardar(registro: Omit<T, 'id'> & { id?: string }): Promise<T>
  eliminar(pacienteId: string, id: string): Promise<void>
}

function hooksDe<T extends RegistroPaciente>(clave: string, servicio: ServicioRecurso<T>) {
  return {
    useLista(pacienteId: string | undefined) {
      return useQuery<T[]>({
        queryKey: [clave, pacienteId],
        queryFn: () => servicio.listar(pacienteId!),
        enabled: Boolean(pacienteId),
      })
    },

    useGuardar(pacienteId: string | undefined) {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: (registro: Omit<T, 'id'> & { id?: string }) => servicio.guardar(registro),
        onSuccess: () => {
          void qc.invalidateQueries({ queryKey: [clave, pacienteId] })
        },
      })
    },

    useEliminar(pacienteId: string | undefined) {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: (id: string) => servicio.eliminar(pacienteId!, id),
        onSuccess: () => {
          void qc.invalidateQueries({ queryKey: [clave, pacienteId] })
        },
      })
    },
  }
}

const antropometria = hooksDe('antropometrias', antropometriaService)
const nino          = hooksDe('evaluaciones-nino', ninoService)
const adolescente   = hooksDe('evaluaciones-adolescente', adolescenteService)
const embarazada    = hooksDe('evaluaciones-embarazada', embarazadaService)
const bioquimica    = hooksDe('bioquimicas', bioquimicaService)
const clinica       = hooksDe('evaluaciones-clinica', clinicaService)
const adulto        = hooksDe('evaluaciones-adulto', adultoService)

export const useAntropometrias      = antropometria.useLista
export const useGuardarAntropometria = antropometria.useGuardar
export const useEliminarAntropometria = antropometria.useEliminar

export const useEvaluacionesNino        = nino.useLista
export const useGuardarEvaluacionNino   = nino.useGuardar

export const useEvaluacionesAdolescente      = adolescente.useLista
export const useGuardarEvaluacionAdolescente = adolescente.useGuardar

export const useEvaluacionesEmbarazada      = embarazada.useLista
export const useGuardarEvaluacionEmbarazada = embarazada.useGuardar

export const useBioquimicas       = bioquimica.useLista
export const useGuardarBioquimica = bioquimica.useGuardar

export const useEvaluacionesClinicas     = clinica.useLista
export const useGuardarEvaluacionClinica = clinica.useGuardar

export const useEvaluacionesAdulto      = adulto.useLista
export const useGuardarEvaluacionAdulto = adulto.useGuardar

/* ── Requerimientos vigentes ──────────────────────────────────── */

/**
 * Requerimientos que alimentan el constructor de dietas: salen de la última
 * evaluación de adulto registrada. Sin evaluación previa devuelve `null`,
 * y el constructor muestra el aviso correspondiente.
 */
export function useRequerimientos(pacienteId: string | undefined) {
  const { data, isLoading } = useEvaluacionesAdulto(pacienteId)
  const ultima = data?.[0]

  // Una evaluación guardada a medias —sin kcal o sin el reparto de
  // macronutrientes— no sirve para construir la dieta: multiplicar por
  // undefined da NaN y el constructor termina mostrando «0 / NaN g» en las
  // barras de cobertura. Se trata como "sin requerimientos" y la pantalla
  // muestra su aviso de que falta la evaluación.
  const kcal = Number(ultima?.requerimientoKcal)
  const pProt = Number(ultima?.porcentajeProteinas)
  const pCarb = Number(ultima?.porcentajeCarbohidratos)
  const pGras = Number(ultima?.porcentajeGrasas)

  const completos =
    Number.isFinite(kcal) && kcal > 0 &&
    Number.isFinite(pProt) && Number.isFinite(pCarb) && Number.isFinite(pGras)

  const requerimientos: RequerimientosPaciente | null = completos
    ? {
        kcal,
        proteinasG: Math.round((kcal * pProt) / 100 / 4),
        carbohidratosG: Math.round((kcal * pCarb) / 100 / 4),
        grasasG: Math.round((kcal * pGras) / 100 / 9),
      }
    : null

  return { requerimientos, evaluacion: ultima ?? null, isLoading }
}
