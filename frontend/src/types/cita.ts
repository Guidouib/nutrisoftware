export type TipoCita = 'primera_vez' | 'seguimiento' | 'control' | 'urgencia'
export type EstadoCita = 'programada' | 'completada' | 'cancelada' | 'no_asistio'
export type ModalidadCita = 'presencial' | 'virtual'

export interface Cita {
  id: string
  pacienteId: string
  pacienteNombre: string
  fecha: string
  tipo: TipoCita
  estado: EstadoCita
  modalidad: ModalidadCita
  notas?: string
  duracionMinutos: number
}

export interface CrearCitaDto {
  pacienteId: string
  fecha: string
  tipo: TipoCita
  modalidad: ModalidadCita
  notas?: string
  duracionMinutos: number
}
