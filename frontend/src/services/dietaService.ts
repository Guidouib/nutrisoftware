import { api } from './api'
import { endpointNoDisponible, localRepo } from './localRepo'
import { esquemaDieta } from '../schemas/dieta.schema'
import type { Dieta } from '../types/dieta'

const clavePaciente = (pacienteId: string) => `dietas:${pacienteId}`

/** Descarta dietas con forma inválida en vez de romper los cálculos de totales. */
function validas(candidatas: unknown[]): Dieta[] {
  return candidatas
    .map(d => esquemaDieta.safeParse(d))
    .filter(r => r.success)
    .map(r => r.data as Dieta)
}

export const dietaService = {
  async listar(pacienteId: string): Promise<Dieta[]> {
    try {
      const { data } = await api.get<unknown[]>('/dietas', { params: { pacienteId } })
      return validas(data)
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return validas(localRepo.lista<unknown>(clavePaciente(pacienteId)))
    }
  },

  async obtener(pacienteId: string, dietaId: string): Promise<Dieta | null> {
    try {
      const { data } = await api.get<unknown>(`/dietas/${dietaId}`)
      return esquemaDieta.safeParse(data).data as Dieta | undefined ?? null
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      const local = validas(localRepo.lista<unknown>(clavePaciente(pacienteId)))
      return local.find(d => d.id === dietaId) ?? null
    }
  },

  async guardar(dieta: Dieta): Promise<Dieta> {
    try {
      const { data } = await api.put<unknown>(`/dietas/${dieta.id}`, dieta)
      return (esquemaDieta.safeParse(data).data as Dieta | undefined) ?? dieta
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return localRepo.guardar<Dieta>(clavePaciente(dieta.pacienteId), dieta)
    }
  },

  async eliminar(pacienteId: string, dietaId: string): Promise<void> {
    try {
      await api.delete(`/dietas/${dietaId}`)
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      localRepo.eliminar(clavePaciente(pacienteId), dietaId)
    }
  },
}
