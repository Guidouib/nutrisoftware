import { nivelPorRango, type NivelSemaforo, type Rango } from './semaforo'
import type { Sexo } from '../types/evaluacion'

/* ═══════════════════════════════════════════════════════════════
   CATÁLOGO DE PARÁMETROS DE LABORATORIO

   Cada parámetro define un rango óptimo y, cuando existe, un rango
   tolerado intermedio. Todo lo que cae fuera del tolerado se marca
   como crítico y dispara la alerta visual en la tabla.
   ═══════════════════════════════════════════════════════════════ */

export interface ParametroBioquimico {
  id: string
  nombre: string
  unidad: string
  grupo: string
  /** Los rangos dependen del sexo en hemoglobina, hematocrito, HDL y ferritina. */
  rangos: (sexo: Sexo) => { optimo: Rango; tolerado?: Rango }
  /** Nota clínica breve mostrada bajo el nombre. */
  nota?: string
}

export const GRUPOS_BIOQUIMICA = [
  'Hematología',
  'Metabolismo glucémico',
  'Perfil lipídico',
  'Proteínas viscerales',
  'Micronutrientes',
] as const

export const PARAMETROS_BIOQUIMICOS: ParametroBioquimico[] = [
  {
    id: 'hemoglobina',
    nombre: 'Hemoglobina',
    unidad: 'g/dL',
    grupo: 'Hematología',
    nota: 'Tamizaje de anemia',
    rangos: sexo =>
      sexo === 'M'
        ? { optimo: [13.5, 17.5], tolerado: [12.0, 18.5] }
        : { optimo: [12.0, 15.5], tolerado: [11.0, 16.5] },
  },
  {
    id: 'hematocrito',
    nombre: 'Hematocrito',
    unidad: '%',
    grupo: 'Hematología',
    rangos: sexo =>
      sexo === 'M'
        ? { optimo: [41, 53], tolerado: [38, 56] }
        : { optimo: [36, 46], tolerado: [33, 50] },
  },
  {
    id: 'glucosa',
    nombre: 'Glucosa en ayunas',
    unidad: 'mg/dL',
    grupo: 'Metabolismo glucémico',
    nota: '100–125 = prediabetes · ≥126 = diabetes',
    rangos: () => ({ optimo: [70, 99], tolerado: [60, 125] }),
  },
  {
    id: 'colesterolTotal',
    nombre: 'Colesterol total',
    unidad: 'mg/dL',
    grupo: 'Perfil lipídico',
    rangos: () => ({ optimo: [null, 199], tolerado: [null, 239] }),
  },
  {
    id: 'ldl',
    nombre: 'Colesterol LDL',
    unidad: 'mg/dL',
    grupo: 'Perfil lipídico',
    nota: 'Objetivo más estricto con riesgo cardiovascular alto',
    rangos: () => ({ optimo: [null, 99], tolerado: [null, 159] }),
  },
  {
    id: 'hdl',
    nombre: 'Colesterol HDL',
    unidad: 'mg/dL',
    grupo: 'Perfil lipídico',
    nota: 'Valores altos son protectores',
    rangos: sexo =>
      sexo === 'M'
        ? { optimo: [40, null], tolerado: [35, null] }
        : { optimo: [50, null], tolerado: [45, null] },
  },
  {
    id: 'trigliceridos',
    nombre: 'Triglicéridos',
    unidad: 'mg/dL',
    grupo: 'Perfil lipídico',
    rangos: () => ({ optimo: [null, 149], tolerado: [null, 199] }),
  },
  {
    id: 'albumina',
    nombre: 'Albúmina',
    unidad: 'g/dL',
    grupo: 'Proteínas viscerales',
    nota: 'Marcador tardío de desnutrición proteica',
    rangos: () => ({ optimo: [3.5, 5.0], tolerado: [3.0, 5.5] }),
  },
  {
    id: 'proteinasTotales',
    nombre: 'Proteínas totales',
    unidad: 'g/dL',
    grupo: 'Proteínas viscerales',
    rangos: () => ({ optimo: [6.0, 8.3], tolerado: [5.5, 9.0] }),
  },
  {
    id: 'ferritina',
    nombre: 'Ferritina',
    unidad: 'ng/mL',
    grupo: 'Micronutrientes',
    nota: 'Reactante de fase aguda: interpretar junto a PCR',
    rangos: sexo =>
      sexo === 'M'
        ? { optimo: [24, 336], tolerado: [15, 400] }
        : { optimo: [11, 307], tolerado: [10, 400] },
  },
  {
    id: 'vitaminaD',
    nombre: 'Vitamina D (25-OH)',
    unidad: 'ng/mL',
    grupo: 'Micronutrientes',
    nota: '20–29 = insuficiencia · <20 = deficiencia',
    rangos: () => ({ optimo: [30, 100], tolerado: [20, 120] }),
  },
  {
    id: 'vitaminaB12',
    nombre: 'Vitamina B12',
    unidad: 'pg/mL',
    grupo: 'Micronutrientes',
    rangos: () => ({ optimo: [200, 900], tolerado: [180, 1100] }),
  },
  {
    id: 'acidoFolico',
    nombre: 'Ácido fólico',
    unidad: 'ng/mL',
    grupo: 'Micronutrientes',
    rangos: () => ({ optimo: [2.7, 17], tolerado: [2.0, 20] }),
  },
]

export function parametroPorId(id: string): ParametroBioquimico | undefined {
  return PARAMETROS_BIOQUIMICOS.find(p => p.id === id)
}

/** Semáforo de un valor de laboratorio según el sexo del paciente. */
export function interpretarValor(
  parametro: ParametroBioquimico,
  valor: number | null,
  sexo: Sexo
): NivelSemaforo {
  const { optimo, tolerado } = parametro.rangos(sexo)
  return nivelPorRango(valor, optimo, tolerado)
}

/** Texto del rango de referencia, para mostrar junto al input. */
export function textoRango(parametro: ParametroBioquimico, sexo: Sexo): string {
  const [min, max] = parametro.rangos(sexo).optimo
  if (min !== null && max !== null) return `${min} – ${max} ${parametro.unidad}`
  if (min !== null) return `≥ ${min} ${parametro.unidad}`
  if (max !== null) return `≤ ${max} ${parametro.unidad}`
  return parametro.unidad
}

/** Etiqueta legible del estado de un valor. */
export function etiquetaNivel(nivel: NivelSemaforo): string {
  if (nivel === 'optimo') return 'Normal'
  if (nivel === 'precaucion') return 'Límite'
  if (nivel === 'critico') return 'Fuera de rango'
  return 'Sin dato'
}
