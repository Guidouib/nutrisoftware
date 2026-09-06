import { api } from './api'
import type { Cita, TipoCita, EstadoCita, ModalidadCita } from '../types/cita'

interface CitaApi {
  id: string
  pacienteId: string
  pacienteNombre: string
  fechaHora: string
  tipoConsulta: string
  modalidad: string
  estado: string
  duracionMinutos: number
  notas?: string
  fechaCreacion: string
}

const tipoMap: Record<string, TipoCita> = {
  PrimeraVez:  'primera_vez',
  Seguimiento: 'seguimiento',
  Control:     'control',
  Urgencia:    'urgencia',
}

const estadoMap: Record<string, EstadoCita> = {
  Programada:  'programada',
  Completada:  'completada',
  Cancelada:   'cancelada',
  NoAsistio:   'no_asistio',
  Confirmada:  'programada',
}

const modalidadMap: Record<string, ModalidadCita> = {
  Presencial: 'presencial',
  Virtual:    'virtual',
}

// Inverso: frontend → API
const tipoToApi: Record<TipoCita, string> = {
  primera_vez: 'PrimeraVez',
  seguimiento: 'Seguimiento',
  control:     'Control',
  urgencia:    'Urgencia',
}

const modalidadToApi: Record<ModalidadCita, string> = {
  presencial: 'Presencial',
  virtual:    'Virtual',
}

function mapCita(a: CitaApi): Cita {
  return {
    id:              a.id,
    pacienteId:      a.pacienteId,
    pacienteNombre:  a.pacienteNombre,
    fecha:           a.fechaHora,
    tipo:            tipoMap[a.tipoConsulta] ?? 'seguimiento',
    estado:          estadoMap[a.estado] ?? 'programada',
    modalidad:       modalidadMap[a.modalidad] ?? 'presencial',
    duracionMinutos: a.duracionMinutos,
    notas:           a.notas,
  }
}

export const citasService = {
  async getAll(mes?: number, anio?: number, pacienteId?: string): Promise<Cita[]> {
    const params: Record<string, string> = {}
    if (mes !== undefined) params.mes = String(mes)
    if (anio !== undefined) params.anio = String(anio)
    if (pacienteId) params.pacienteId = pacienteId
    const { data } = await api.get<CitaApi[]>('/citas', { params })
    return data.map(mapCita)
  },

  async create(payload: {
    pacienteId: string
    fechaHora: string
    tipo: TipoCita
    modalidad: ModalidadCita
    duracionMinutos: number
    notas?: string
  }): Promise<Cita> {
    const body = {
      pacienteId:      payload.pacienteId,
      fechaHora:       payload.fechaHora,
      tipoConsulta:    tipoToApi[payload.tipo],
      modalidad:       modalidadToApi[payload.modalidad],
      duracionMinutos: payload.duracionMinutos,
      notas:           payload.notas || null,
    }
    const { data } = await api.post<CitaApi>('/citas', body)
    return mapCita(data)
  },

  async cambiarEstado(id: string, estado: EstadoCita): Promise<Cita> {
    const estadoApi: Record<EstadoCita, string> = {
      programada:  'Programada',
      completada:  'Completada',
      cancelada:   'Cancelada',
      no_asistio:  'NoAsistio',
    }
    const { data } = await api.patch<CitaApi>(`/citas/${id}/estado`, { estado: estadoApi[estado] })
    return mapCita(data)
  },

  async eliminar(id: string): Promise<void> {
    await api.delete(`/citas/${id}`)
  },
}
