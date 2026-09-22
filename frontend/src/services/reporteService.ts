import { api } from './api'
import { endpointNoDisponible, localRepo, nuevoId } from './localRepo'
import type { ConfiguracionPdf, PdfGenerado } from '../types/reporte'

const claveHistorial = (pacienteId: string) => `pdfs:${pacienteId}`
const CLAVE_CONFIG = 'config-pdf'

export interface SolicitudPdf {
  pacienteId: string
  dietaId: string
  configuracion: ConfiguracionPdf
}

export const reporteService = {
  /** La configuración del membrete se reutiliza entre reportes. */
  leerConfiguracion(): Partial<ConfiguracionPdf> {
    return localRepo.leer<Partial<ConfiguracionPdf>>(CLAVE_CONFIG, {})
  },

  guardarConfiguracion(config: ConfiguracionPdf): void {
    localRepo.escribir(CLAVE_CONFIG, config)
  },

  async historial(pacienteId: string): Promise<PdfGenerado[]> {
    try {
      const { data } = await api.get<PdfGenerado[]>('/reportes', { params: { pacienteId } })
      return data
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return localRepo.lista<PdfGenerado>(claveHistorial(pacienteId))
    }
  },

  /**
   * Pide el PDF al backend (QuestPDF).
   * Mientras ese endpoint no exista, se deja registrado el intento con estado
   * `pendiente`: la configuración queda guardada y el documento se emitirá en
   * cuanto el controlador esté disponible. No se simula ningún archivo.
   */
  async generar(solicitud: SolicitudPdf): Promise<PdfGenerado> {
    try {
      const { data } = await api.post<PdfGenerado>('/reportes/dieta', solicitud)
      return data
    } catch (error) {
      if (!endpointNoDisponible(error)) throw error
      return localRepo.agregar<PdfGenerado>(claveHistorial(solicitud.pacienteId), {
        id: nuevoId(),
        pacienteId: solicitud.pacienteId,
        dietaId: solicitud.dietaId,
        tipo: solicitud.configuracion.titulo,
        fecha: new Date().toISOString(),
        tamanioBytes: null,
        url: null,
        estado: 'pendiente',
      })
    }
  },

  /**
   * Descarga el binario. El endpoint exige el token de sesión, así que no
   * sirve un `<a href download>`: se pide con axios (el interceptor añade el
   * Bearer) y se entrega como Blob para abrirlo con un object URL.
   */
  async descargar(reporteId: string): Promise<Blob> {
    const { data } = await api.get<Blob>(`/reportes/${reporteId}/descargar`, {
      responseType: 'blob',
    })
    return data
  },

  async enviarPorEmail(reporteId: string): Promise<void> {
    await api.post(`/reportes/${reporteId}/enviar`)
  },
}

/** Dispara la descarga en el navegador y libera el object URL. */
export function guardarBlobComo(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
