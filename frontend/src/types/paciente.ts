export interface Paciente {
  id: string
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  fechaNacimiento: string
  sexo: 'M' | 'F'
  dni?: string
  direccion?: string
  foto?: string
  estado: 'activo' | 'inactivo'
  fechaCreacion: string
  ultimaCita?: string
  notas?: string
}

export interface CrearPacienteDto {
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  fechaNacimiento: string
  sexo: 'M' | 'F'
  dni?: string
  direccion?: string
  notas?: string
  foto?: string
}
