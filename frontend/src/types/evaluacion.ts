export type Sexo = 'M' | 'F'

export type TipoEvaluacion = 'nino' | 'adolescente' | 'embarazada' | 'adulto'

export const TIPOS_EVALUACION: { valor: TipoEvaluacion; titulo: string; rango: string; descripcion: string }[] = [
  { valor: 'nino',         titulo: 'Niño',        rango: '0 – 11 años',  descripcion: 'Z-scores OMS, curvas de crecimiento y perímetro cefálico.' },
  { valor: 'adolescente',  titulo: 'Adolescente', rango: '12 – 17 años', descripcion: 'Percentiles CDC/OMS y ajuste por estadio de Tanner.' },
  { valor: 'embarazada',   titulo: 'Embarazada',  rango: 'Gestación',    descripcion: 'IMC pregestacional y ganancia de peso IOM 2009.' },
  { valor: 'adulto',       titulo: 'Adulto',      rango: '18 años o más', descripcion: 'Diagnóstico integrado y prescripción nutroterapéutica.' },
]

export type NivelISAK = 1 | 2 | 3 | 4

/** Valores crudos del formulario ISAK, indexados por el `id` del campo. */
export type MedidasISAK = Record<string, number | undefined>

export interface Somatotipo {
  endomorfia: number
  mesomorfia: number
  ectomorfia: number
  /** Coordenadas de somatocarta: x = ecto − endo, y = 2·meso − (endo + ecto). */
  x: number
  y: number
  categoria: string
}

export interface ResultadoAntropometria {
  imc: number | null
  clasificacionImc: string | null
  porcentajeGrasa: number | null
  metodoGrasa: string | null
  masaGrasaKg: number | null
  masaLibreGrasaKg: number | null
  indiceCinturaCadera: number | null
  somatotipo: Somatotipo | null
}

export interface Antropometria {
  id: string
  pacienteId: string
  fecha: string
  nivelIsak: NivelISAK
  medidas: MedidasISAK
  resultado: ResultadoAntropometria
  observaciones?: string
}

/* ── Niño ─────────────────────────────────────────────────────── */

export interface EvaluacionNino {
  id: string
  pacienteId: string
  fecha: string
  edadMeses: number
  sexo: Sexo
  peso: number
  talla: number
  perimetroCefalico?: number
  zPesoEdad: number | null
  zTallaEdad: number | null
  zPesoTalla: number | null
  zImcEdad: number | null
  diagnostico: string
  prescripcion?: string
}

/* ── Adolescente ──────────────────────────────────────────────── */

export type EstadioTanner = 'I' | 'II' | 'III' | 'IV' | 'V'

export interface EvaluacionAdolescente {
  id: string
  pacienteId: string
  fecha: string
  edadMeses: number
  sexo: Sexo
  peso: number
  talla: number
  tanner: EstadioTanner
  imc: number
  percentilImc: number | null
  zImcEdad: number | null
  diagnostico: string
  requerimientoKcal: number
  requerimientoProteinaG: number
  prescripcion?: string
}

/* ── Embarazada ───────────────────────────────────────────────── */

export interface EvaluacionEmbarazada {
  id: string
  pacienteId: string
  fecha: string
  pesoPregestacional: number
  talla: number
  pesoActual: number
  semanasGestacion: number
  trimestre: 1 | 2 | 3
  imcPregestacional: number
  categoriaImc: string
  gananciaActual: number
  gananciaMin: number
  gananciaMax: number
  alturaUterinaMedida?: number
  alturaUterinaEsperada: number | null
  prescripcion?: string
}

/* ── Bioquímica ───────────────────────────────────────────────── */

export interface ValorBioquimico {
  parametroId: string
  valor: number | null
}

export interface Bioquimica {
  id: string
  pacienteId: string
  fecha: string
  valores: ValorBioquimico[]
  observaciones?: string
}

/* ── Clínica ──────────────────────────────────────────────────── */

export interface SignoMarcado {
  signoId: string
  presente: boolean
  observacion?: string
}

export interface EvaluacionClinica {
  id: string
  pacienteId: string
  fecha: string
  signos: SignoMarcado[]
  deficienciasDetectadas: string[]
  observaciones?: string
}

/* ── Adulto ───────────────────────────────────────────────────── */

export type ModalidadConsulta = 'presencial' | 'virtual'

export interface ItemRecordatorio {
  id: string
  tiempo: string
  hora: string
  descripcion: string
  kcalAprox?: number
}

export interface EvaluacionAdulto {
  id: string
  pacienteId: string
  fecha: string
  modalidad: ModalidadConsulta
  peso?: number
  talla?: number
  imc: number | null
  recordatorio24h: ItemRecordatorio[]
  diagnostico: string
  prescripcionNutroterapeutica: string
  requerimientoKcal: number
  porcentajeProteinas: number
  porcentajeCarbohidratos: number
  porcentajeGrasas: number
}

/** Requerimientos que viajan de la evaluación al constructor de dietas. */
export interface RequerimientosPaciente {
  kcal: number
  proteinasG: number
  carbohidratosG: number
  grasasG: number
}
