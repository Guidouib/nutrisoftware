import { api } from './api'
import { endpointNoDisponible, localRepo, nuevoId } from './localRepo'
import type {
  Antropometria,
  Bioquimica,
  EvaluacionAdolescente,
  EvaluacionAdulto,
  EvaluacionClinica,
  EvaluacionEmbarazada,
  EvaluacionNino,
} from '../types/evaluacion'

/**
 * Los siete sub-módulos de evaluación comparten la misma forma de recurso
 * (colección por paciente, ordenada por fecha descendente), así que se
 * generan desde una única fábrica en vez de repetir siete services.
 */
interface RegistroPaciente {
  id: string
  pacienteId: string
  fecha: string
}

function recurso<T extends RegistroPaciente>(ruta: string) {
  const claveLocal = (pacienteId: string) => `${ruta}:${pacienteId}`

  const porFechaDesc = (a: T, b: T) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0)

  return {
    async listar(pacienteId: string): Promise<T[]> {
      try {
        const { data } = await api.get<T[]>(`/${ruta}`, { params: { pacienteId } })
        return [...data].sort(porFechaDesc)
      } catch (error) {
        if (!endpointNoDisponible(error)) throw error
        return localRepo.lista<T>(claveLocal(pacienteId)).sort(porFechaDesc)
      }
    },

    async guardar(registro: Omit<T, 'id'> & { id?: string }): Promise<T> {
      const conId = { ...registro, id: registro.id ?? nuevoId() } as T
      try {
        const { data } = conId.id.startsWith('local-') || !registro.id
          ? await api.post<T>(`/${ruta}`, registro)
          : await api.put<T>(`/${ruta}/${registro.id}`, registro)
        return data
      } catch (error) {
        if (!endpointNoDisponible(error)) throw error
        return localRepo.guardar<T>(claveLocal(conId.pacienteId), conId)
      }
    },

    async eliminar(pacienteId: string, id: string): Promise<void> {
      try {
        await api.delete(`/${ruta}/${id}`)
      } catch (error) {
        if (!endpointNoDisponible(error)) throw error
        localRepo.eliminar(claveLocal(pacienteId), id)
      }
    },
  }
}

export const antropometriaService  = recurso<Antropometria>('antropometrias')
export const ninoService           = recurso<EvaluacionNino>('evaluaciones-nino')
export const adolescenteService    = recurso<EvaluacionAdolescente>('evaluaciones-adolescente')
export const embarazadaService     = recurso<EvaluacionEmbarazada>('evaluaciones-embarazada')
export const bioquimicaService     = recurso<Bioquimica>('bioquimicas')
export const clinicaService        = recurso<EvaluacionClinica>('evaluaciones-clinica')
export const adultoService         = recurso<EvaluacionAdulto>('evaluaciones-adulto')
