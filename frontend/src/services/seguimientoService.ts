import { api } from './api'
import { endpointNoDisponible, localRepo, nuevoId } from './localRepo'
import type { ControlSeguimiento, MetaPaciente } from '../types/seguimiento'

const claveControles = (pacienteId: string) => `seguimiento:${pacienteId}`
const claveMeta = (pacienteId: string) => `meta:${pacienteId}`

const porFechaDesc = (a: ControlSeguimiento, b: ControlSeguimiento) =>
  a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0

export const seguimientoService = {
  async listar(pacienteId: string): Promise<ControlSeguimiento[]> {
    try {
      const { data } = await api.get<ControlSeguimiento[]>('/seguimiento', { params: { pacienteId } })
      return [...data].sort(porFechaDesc)
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return localRepo.lista<ControlSeguimiento>(claveControles(pacienteId)).sort(porFechaDesc)
    }
  },

  async crear(control: Omit<ControlSeguimiento, 'id'>): Promise<ControlSeguimiento> {
    try {
      const { data } = await api.post<ControlSeguimiento>('/seguimiento', control)
      return data
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return localRepo.agregar<ControlSeguimiento>(claveControles(control.pacienteId), {
        ...control,
        id: nuevoId(),
      })
    }
  },

  async eliminar(pacienteId: string, id: string): Promise<void> {
    try {
      await api.delete(`/seguimiento/${id}`)
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      localRepo.eliminar(claveControles(pacienteId), id)
    }
  },

  /* ── Meta de peso ── */

  async obtenerMeta(pacienteId: string): Promise<MetaPaciente> {
    try {
      const { data } = await api.get<MetaPaciente>(`/pacientes/${pacienteId}/meta`)
      return data
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return localRepo.leer<MetaPaciente>(claveMeta(pacienteId), { pacienteId, pesoObjetivo: null })
    }
  },

  async guardarMeta(meta: MetaPaciente): Promise<MetaPaciente> {
    try {
      const { data } = await api.put<MetaPaciente>(`/pacientes/${meta.pacienteId}/meta`, meta)
      return data
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return localRepo.escribir(claveMeta(meta.pacienteId), meta)
    }
  },
}
