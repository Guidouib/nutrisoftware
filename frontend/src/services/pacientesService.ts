import { api } from './api'
import type { Paciente, CrearPacienteDto } from '../types/paciente'

interface PacienteApi {
  id: string
  nombres: string
  apellidos: string
  fechaNacimiento: string
  edad: number
  sexo: string
  email?: string
  telefono?: string
  dni?: string
  direccion?: string
  fotoUrl?: string
  notas?: string
  activo: boolean
  fechaCreacion: string
  ultimaCita?: string
}

function mapPaciente(a: PacienteApi): Paciente {
  return {
    id:              a.id,
    nombre:          a.nombres,
    apellido:        a.apellidos,
    fechaNacimiento: a.fechaNacimiento,
    sexo:            a.sexo as 'M' | 'F',
    email:           a.email,
    telefono:        a.telefono,
    dni:             a.dni,
    direccion:       a.direccion,
    foto:            a.fotoUrl,
    notas:           a.notas,
    estado:          a.activo ? 'activo' : 'inactivo',
    fechaCreacion:   a.fechaCreacion,
    ultimaCita:      a.ultimaCita,
  }
}

export const pacientesService = {
  async getAll(busqueda?: string, activo?: boolean): Promise<Paciente[]> {
    const params: Record<string, string> = {}
    if (busqueda) params.busqueda = busqueda
    if (activo !== undefined) params.activo = String(activo)
    const { data } = await api.get<PacienteApi[]>('/pacientes', { params })
    return data.map(mapPaciente)
  },

  async getById(id: string): Promise<Paciente> {
    const { data } = await api.get<PacienteApi>(`/pacientes/${id}`)
    return mapPaciente(data)
  },

  async create(dto: CrearPacienteDto): Promise<Paciente> {
    const body = {
      nombres:         dto.nombre,
      apellidos:       dto.apellido,
      fechaNacimiento: dto.fechaNacimiento,
      sexo:            dto.sexo,
      email:           dto.email || null,
      telefono:        dto.telefono || null,
      dni:             dto.dni || null,
      direccion:       dto.direccion || null,
      fotoUrl:         null,
      notas:           dto.notas || null,
    }
    const { data } = await api.post<PacienteApi>('/pacientes', body)
    return mapPaciente(data)
  },

  async update(id: string, dto: CrearPacienteDto): Promise<Paciente> {
    const body = {
      nombres:         dto.nombre,
      apellidos:       dto.apellido,
      fechaNacimiento: dto.fechaNacimiento,
      sexo:            dto.sexo,
      email:           dto.email || null,
      telefono:        dto.telefono || null,
      dni:             dto.dni || null,
      direccion:       dto.direccion || null,
      fotoUrl:         null,
      notas:           dto.notas || null,
    }
    const { data } = await api.put<PacienteApi>(`/pacientes/${id}`, body)
    return mapPaciente(data)
  },

  async toggleEstado(id: string): Promise<Paciente> {
    const { data } = await api.patch<PacienteApi>(`/pacientes/${id}/estado`)
    return mapPaciente(data)
  },
}
