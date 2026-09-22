export type EsquemaColorPdf = 'verde' | 'azul' | 'morado' | 'naranja'
export type FuentePdf = 'Inter' | 'Roboto' | 'Open Sans'

export const ESQUEMAS_COLOR: { valor: EsquemaColorPdf; titulo: string; hex: string; suave: string }[] = [
  { valor: 'verde',   titulo: 'Verde',   hex: '#0D9F63', suave: '#EDFAF4' },
  { valor: 'azul',    titulo: 'Azul',    hex: '#2563EB', suave: '#EFF6FF' },
  { valor: 'morado',  titulo: 'Morado',  hex: '#7C3AED', suave: '#F5F3FF' },
  { valor: 'naranja', titulo: 'Naranja', hex: '#EA580C', suave: '#FFF7ED' },
]

export const FUENTES_PDF: FuentePdf[] = ['Inter', 'Roboto', 'Open Sans']

/** Secciones que el nutricionista puede incluir o excluir del documento. */
export interface SeccionesPdf {
  datosPaciente: boolean
  requerimientos: boolean
  dietaPorDia: boolean
  listaCompras: boolean
  recomendaciones: boolean
  firma: boolean
}

export interface ConfiguracionPdf {
  titulo: string
  logoDataUrl: string | null
  consultorio: string
  profesional: string
  contacto: string
  secciones: SeccionesPdf
  recomendaciones: string
  esquemaColor: EsquemaColorPdf
  fuente: FuentePdf
}

export const SECCIONES_POR_DEFECTO: SeccionesPdf = {
  datosPaciente: true,
  requerimientos: true,
  dietaPorDia: true,
  listaCompras: true,
  recomendaciones: true,
  firma: true,
}

export const ETIQUETAS_SECCION: Record<keyof SeccionesPdf, { titulo: string; detalle: string }> = {
  datosPaciente:   { titulo: 'Datos del paciente',        detalle: 'Nombre, edad y sexo' },
  requerimientos:  { titulo: 'Requerimientos nutricionales', detalle: 'Kcal y macronutrientes objetivo' },
  dietaPorDia:     { titulo: 'Dieta día por día',         detalle: 'Los 7 días con sus tiempos de comida' },
  listaCompras:    { titulo: 'Lista de compras semanal',  detalle: 'Generada automáticamente de la dieta' },
  recomendaciones: { titulo: 'Recomendaciones generales', detalle: 'Texto libre al cierre del documento' },
  firma:           { titulo: 'Firma y sello',             detalle: 'Espacio para la firma del nutricionista' },
}

export type EstadoPdf = 'listo' | 'pendiente'

export interface PdfGenerado {
  id: string
  pacienteId: string
  dietaId: string
  tipo: string
  fecha: string
  tamanioBytes: number | null
  url: string | null
  estado: EstadoPdf
}
