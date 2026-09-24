import { api } from './api'
import type {
  GuardarRegistroConsumoRequest,
  RegistroConsumo,
  RegistroConsumoResumen,
} from '../types/consumo'

export const consumoService = {
  async listar(pacienteId: string): Promise<RegistroConsumoResumen[]> {
    const { data } = await api.get<RegistroConsumoResumen[]>('/consumo', {
      params: { pacienteId },
    })
    return data
  },

  /**
   * Devuelve `null` cuando el recordatorio todavía no existe.
   *
   * La pantalla genera el id antes de guardar nada, así que el primer intento
   * de leerlo responde 404 legítimamente: no es un error que deba propagarse.
   */
  async obtener(registroId: string): Promise<RegistroConsumo | null> {
    try {
      const { data } = await api.get<RegistroConsumo>(`/consumo/${registroId}`)
      return data
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 404) return null
      throw error
    }
  },

  async guardar(
    registroId: string,
    cuerpo: GuardarRegistroConsumoRequest
  ): Promise<RegistroConsumo> {
    const { data } = await api.put<RegistroConsumo>(`/consumo/${registroId}`, cuerpo)
    return data
  },

  async eliminar(registroId: string): Promise<void> {
    await api.delete(`/consumo/${registroId}`)
  },

  /**
   * Descarga el CSV de todos los recordatorios del paciente.
   *
   * Se pide con axios y se arma un object URL porque la ruta exige el token:
   * un `<a href download>` no manda la cabecera de autorización.
   */
  async exportarCsv(pacienteId: string, nombreArchivo: string): Promise<void> {
    const { data } = await api.get<Blob>('/consumo/exportar', {
      params: { pacienteId },
      responseType: 'blob',
    })

    const url = URL.createObjectURL(data)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombreArchivo
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    URL.revokeObjectURL(url)
  },
}
