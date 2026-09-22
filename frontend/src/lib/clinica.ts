/* ═══════════════════════════════════════════════════════════════
   SIGNOS CLÍNICOS DE DEFICIENCIA NUTRICIONAL

   Checklist por sistemas. Cada signo apunta a los nutrientes cuya
   carencia lo produce con más frecuencia, y algunos se enlazan con
   un parámetro de laboratorio para cruzar hallazgo clínico y
   bioquímica en la misma pantalla.
   ═══════════════════════════════════════════════════════════════ */

export interface SignoClinico {
  id: string
  nombre: string
  descripcion: string
  /** Nutrientes cuya deficiencia explica el signo. */
  deficiencias: string[]
  /** `id` de PARAMETROS_BIOQUIMICOS con el que se contrasta el hallazgo. */
  parametrosRelacionados?: string[]
}

export interface SistemaClinico {
  id: string
  titulo: string
  descripcion: string
  signos: SignoClinico[]
}

export const SISTEMAS_CLINICOS: SistemaClinico[] = [
  {
    id: 'piel',
    titulo: 'Piel y faneras',
    descripcion: 'Piel, cabello y uñas',
    signos: [
      {
        id: 'xerosis',
        nombre: 'Xerosis / piel seca y escamosa',
        descripcion: 'Descamación fina, aspecto de "piel de lija"',
        deficiencias: ['Vitamina A', 'Ácidos grasos esenciales'],
      },
      {
        id: 'petequias',
        nombre: 'Petequias o equimosis',
        descripcion: 'Hemorragias puntiformes, hematomas ante mínimo trauma',
        deficiencias: ['Vitamina C', 'Vitamina K'],
      },
      {
        id: 'dermatitisPelagrosa',
        nombre: 'Dermatitis en zonas expuestas',
        descripcion: 'Lesión simétrica en cuello y dorso de manos (collar de Casal)',
        deficiencias: ['Niacina (B3)'],
      },
      {
        id: 'cabelloQuebradizo',
        nombre: 'Cabello quebradizo o despigmentado',
        descripcion: 'Se desprende sin dolor, pierde brillo y color',
        deficiencias: ['Proteína', 'Zinc', 'Hierro'],
        parametrosRelacionados: ['albumina', 'proteinasTotales', 'ferritina'],
      },
      {
        id: 'coiloniquia',
        nombre: 'Coiloniquia (uñas en cuchara)',
        descripcion: 'Uñas cóncavas, finas y frágiles',
        deficiencias: ['Hierro'],
        parametrosRelacionados: ['hemoglobina', 'ferritina'],
      },
      {
        id: 'cicatrizacionLenta',
        nombre: 'Retraso en la cicatrización',
        descripcion: 'Heridas que tardan más de lo esperado en cerrar',
        deficiencias: ['Zinc', 'Proteína', 'Vitamina C'],
        parametrosRelacionados: ['albumina'],
      },
    ],
  },
  {
    id: 'ojos',
    titulo: 'Ojos',
    descripcion: 'Conjuntiva, córnea y agudeza visual',
    signos: [
      {
        id: 'xeroftalmia',
        nombre: 'Xeroftalmia / manchas de Bitot',
        descripcion: 'Conjuntiva seca con placas espumosas blanquecinas',
        deficiencias: ['Vitamina A'],
      },
      {
        id: 'palidezConjuntival',
        nombre: 'Palidez conjuntival',
        descripcion: 'Mucosa conjuntival decolorada',
        deficiencias: ['Hierro', 'Vitamina B12', 'Ácido fólico'],
        parametrosRelacionados: ['hemoglobina', 'hematocrito', 'vitaminaB12', 'acidoFolico'],
      },
      {
        id: 'fotofobia',
        nombre: 'Fotofobia o vascularización corneal',
        descripcion: 'Molestia ante la luz, vasos visibles en córnea',
        deficiencias: ['Riboflavina (B2)'],
      },
    ],
  },
  {
    id: 'boca',
    titulo: 'Boca y mucosas',
    descripcion: 'Labios, lengua, encías y gusto',
    signos: [
      {
        id: 'queilosis',
        nombre: 'Queilosis / estomatitis angular',
        descripcion: 'Fisuras y costras en las comisuras labiales',
        deficiencias: ['Riboflavina (B2)', 'Niacina (B3)', 'Piridoxina (B6)', 'Hierro'],
        parametrosRelacionados: ['hemoglobina', 'ferritina'],
      },
      {
        id: 'glositis',
        nombre: 'Glositis',
        descripcion: 'Lengua roja, lisa y dolorosa por atrofia papilar',
        deficiencias: ['Vitamina B12', 'Ácido fólico', 'Niacina (B3)', 'Riboflavina (B2)'],
        parametrosRelacionados: ['vitaminaB12', 'acidoFolico'],
      },
      {
        id: 'enciasSangrantes',
        nombre: 'Encías sangrantes o esponjosas',
        descripcion: 'Sangrado al cepillado, encías inflamadas',
        deficiencias: ['Vitamina C'],
      },
      {
        id: 'disgeusia',
        nombre: 'Disgeusia',
        descripcion: 'Alteración o pérdida del sentido del gusto',
        deficiencias: ['Zinc'],
      },
    ],
  },
  {
    id: 'nervioso',
    titulo: 'Sistema nervioso',
    descripcion: 'Sensibilidad, marcha y estado de ánimo',
    signos: [
      {
        id: 'parestesias',
        nombre: 'Parestesias en guante y calcetín',
        descripcion: 'Hormigueo simétrico distal en manos y pies',
        deficiencias: ['Vitamina B12', 'Tiamina (B1)'],
        parametrosRelacionados: ['vitaminaB12'],
      },
      {
        id: 'irritabilidad',
        nombre: 'Irritabilidad o confusión',
        descripcion: 'Cambios recientes en atención y conducta',
        deficiencias: ['Tiamina (B1)', 'Niacina (B3)', 'Vitamina B12'],
        parametrosRelacionados: ['vitaminaB12'],
      },
      {
        id: 'ataxia',
        nombre: 'Ataxia o pérdida de propiocepción',
        descripcion: 'Marcha inestable, Romberg positivo',
        deficiencias: ['Vitamina B12', 'Vitamina E'],
        parametrosRelacionados: ['vitaminaB12'],
      },
      {
        id: 'apatia',
        nombre: 'Apatía o ánimo depresivo',
        descripcion: 'Desgano persistente sin causa aparente',
        deficiencias: ['Vitamina B12', 'Ácido fólico', 'Hierro', 'Vitamina D'],
        parametrosRelacionados: ['vitaminaB12', 'acidoFolico', 'vitaminaD', 'ferritina'],
      },
    ],
  },
  {
    id: 'musculoEsqueletico',
    titulo: 'Músculo-esquelético',
    descripcion: 'Masa muscular, hueso y edema',
    signos: [
      {
        id: 'atrofiaMuscular',
        nombre: 'Debilidad o atrofia muscular',
        descripcion: 'Pérdida visible de masa en temporales, deltoides o cuádriceps',
        deficiencias: ['Proteína', 'Energía total'],
        parametrosRelacionados: ['albumina', 'proteinasTotales'],
      },
      {
        id: 'dolorOseo',
        nombre: 'Dolor óseo o deformidad',
        descripcion: 'Dolor a la presión ósea, genu varo/valgo',
        deficiencias: ['Vitamina D', 'Calcio'],
        parametrosRelacionados: ['vitaminaD'],
      },
      {
        id: 'calambres',
        nombre: 'Calambres o tetania',
        descripcion: 'Contracciones involuntarias, signo de Chvostek',
        deficiencias: ['Calcio', 'Magnesio', 'Potasio'],
      },
      {
        id: 'edema',
        nombre: 'Edema en miembros inferiores',
        descripcion: 'Fóvea maleolar o pretibial bilateral',
        deficiencias: ['Proteína (hipoalbuminemia)', 'Tiamina (B1)'],
        parametrosRelacionados: ['albumina', 'proteinasTotales'],
      },
    ],
  },
  {
    id: 'gastrointestinal',
    titulo: 'Gastrointestinal',
    descripcion: 'Apetito, tránsito y abdomen',
    signos: [
      {
        id: 'diarreaCronica',
        nombre: 'Diarrea crónica',
        descripcion: 'Más de 4 semanas de deposiciones líquidas',
        deficiencias: ['Niacina (B3)', 'Zinc', 'Ácido fólico'],
        parametrosRelacionados: ['acidoFolico'],
      },
      {
        id: 'anorexia',
        nombre: 'Anorexia o saciedad precoz',
        descripcion: 'Pérdida del apetito, ingesta reducida sostenida',
        deficiencias: ['Zinc', 'Hierro'],
        parametrosRelacionados: ['ferritina'],
      },
      {
        id: 'hepatomegalia',
        nombre: 'Hepatomegalia',
        descripcion: 'Hígado palpable bajo el reborde costal',
        deficiencias: ['Proteína (kwashiorkor)'],
        parametrosRelacionados: ['albumina'],
      },
      {
        id: 'nauseas',
        nombre: 'Náuseas o vómitos recurrentes',
        descripcion: 'Episodios repetidos que comprometen la ingesta',
        deficiencias: ['Piridoxina (B6)', 'Hidratación'],
      },
    ],
  },
]

export const TODOS_LOS_SIGNOS: SignoClinico[] = SISTEMAS_CLINICOS.flatMap(s => s.signos)

export function signoPorId(id: string): SignoClinico | undefined {
  return TODOS_LOS_SIGNOS.find(s => s.id === id)
}

/**
 * Deficiencias sugeridas por los signos marcados, ordenadas por número de
 * signos que las respaldan: cuantos más hallazgos apuntan al mismo nutriente,
 * mayor la sospecha.
 */
export function deficienciasSugeridas(signosPresentes: string[]): { nutriente: string; signos: string[] }[] {
  const mapa = new Map<string, string[]>()

  for (const id of signosPresentes) {
    const signo = signoPorId(id)
    if (!signo) continue
    for (const nutriente of signo.deficiencias) {
      mapa.set(nutriente, [...(mapa.get(nutriente) ?? []), signo.nombre])
    }
  }

  return [...mapa.entries()]
    .map(([nutriente, signos]) => ({ nutriente, signos }))
    .sort((a, b) => b.signos.length - a.signos.length || a.nutriente.localeCompare(b.nutriente))
}
