import { nuevoId } from '../services/localRepo'
import type { Alimento } from '../types/alimento'
import type {
  AlimentoEnDieta,
  DiaDietaDetalle,
  DiaSemana,
  Dieta,
  EstadoDia,
  NutrientesCalculados,
  TiempoComidaDieta,
} from '../types/dieta'
import type { RequerimientosPaciente } from '../types/evaluacion'

export const DIAS_SEMANA: { valor: DiaSemana; corto: string; largo: string }[] = [
  { valor: 0, corto: 'Lun', largo: 'Lunes' },
  { valor: 1, corto: 'Mar', largo: 'Martes' },
  { valor: 2, corto: 'Mié', largo: 'Miércoles' },
  { valor: 3, corto: 'Jue', largo: 'Jueves' },
  { valor: 4, corto: 'Vie', largo: 'Viernes' },
  { valor: 5, corto: 'Sáb', largo: 'Sábado' },
  { valor: 6, corto: 'Dom', largo: 'Domingo' },
]

export const TIEMPOS_COMIDA = [
  'Desayuno',
  'Media mañana',
  'Almuerzo',
  'Media tarde',
  'Cena',
  'Cena tardía',
] as const

/** Tiempos que deben tener alimentos para considerar el día completo. */
const TIEMPOS_PRINCIPALES = ['Desayuno', 'Almuerzo', 'Cena']

const redondear = (n: number, d = 1) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

/* ── Construcción ─────────────────────────────────────────────── */

export function tiemposVacios(): TiempoComidaDieta[] {
  return TIEMPOS_COMIDA.map(nombre => ({ id: nuevoId(), nombre, alimentos: [] }))
}

export function dietaVacia(pacienteId: string, requerimientos: RequerimientosPaciente): Dieta {
  return {
    id: nuevoId(),
    pacienteId,
    fecha: new Date().toISOString().slice(0, 10),
    nombre: 'Plan nutricional semanal',
    requerimientos,
    dias: DIAS_SEMANA.map(d => ({ diaSemana: d.valor, tiempos: tiemposVacios() })),
    modoIntercambios: false,
  }
}

/** Convierte un alimento del buscador en un ítem de dieta con su cantidad. */
export function aAlimentoEnDieta(alimento: Alimento, gramos: number): AlimentoEnDieta {
  return {
    id: nuevoId(),
    alimentoId: alimento.id,
    nombre: alimento.nombre,
    fuente: alimento.fuente,
    gramos,
    energia100: alimento.energia,
    proteinas100: alimento.proteinas,
    grasas100: alimento.grasas,
    carbohidratos100: alimento.carbohidratos,
    fibra100: alimento.fibra,
  }
}

/* ── Cálculo de nutrientes ────────────────────────────────────── */

/** Regla de proporción sobre los valores por 100 g. */
export function nutrientesDe(item: AlimentoEnDieta): NutrientesCalculados {
  const factor = item.gramos / 100
  return {
    energia: redondear(item.energia100 * factor, 0),
    proteinas: redondear(item.proteinas100 * factor, 1),
    grasas: redondear(item.grasas100 * factor, 1),
    carbohidratos: redondear(item.carbohidratos100 * factor, 1),
    fibra: redondear(item.fibra100 * factor, 1),
  }
}

const CERO: NutrientesCalculados = { energia: 0, proteinas: 0, grasas: 0, carbohidratos: 0, fibra: 0 }

function sumar(a: NutrientesCalculados, b: NutrientesCalculados): NutrientesCalculados {
  return {
    energia: a.energia + b.energia,
    proteinas: a.proteinas + b.proteinas,
    grasas: a.grasas + b.grasas,
    carbohidratos: a.carbohidratos + b.carbohidratos,
    fibra: a.fibra + b.fibra,
  }
}

function normalizar(n: NutrientesCalculados): NutrientesCalculados {
  return {
    energia: Math.round(n.energia),
    proteinas: redondear(n.proteinas, 1),
    grasas: redondear(n.grasas, 1),
    carbohidratos: redondear(n.carbohidratos, 1),
    fibra: redondear(n.fibra, 1),
  }
}

export function totalesDeTiempo(tiempo: TiempoComidaDieta): NutrientesCalculados {
  return normalizar(tiempo.alimentos.map(nutrientesDe).reduce(sumar, CERO))
}

export function totalesDeDia(dia: DiaDietaDetalle): NutrientesCalculados {
  return normalizar(dia.tiempos.map(totalesDeTiempo).reduce(sumar, CERO))
}

/* ── Estado del día ───────────────────────────────────────────── */

export function estadoDia(dia: DiaDietaDetalle): EstadoDia {
  const conAlimentos = dia.tiempos.filter(t => t.alimentos.length > 0)
  if (conAlimentos.length === 0) return 'vacio'

  const principalesCubiertos = TIEMPOS_PRINCIPALES.every(nombre =>
    dia.tiempos.some(t => t.nombre === nombre && t.alimentos.length > 0)
  )
  return principalesCubiertos ? 'completo' : 'incompleto'
}

/* ── Cobertura frente al objetivo ─────────────────────────────── */

export interface CoberturaMacro {
  clave: 'kcal' | 'proteinas' | 'carbohidratos' | 'grasas'
  titulo: string
  unidad: string
  actual: number
  objetivo: number
  /** % cubierto; 0 cuando no hay objetivo definido. */
  porcentaje: number
  diferencia: number
}

export function coberturas(
  totales: NutrientesCalculados,
  req: RequerimientosPaciente
): CoberturaMacro[] {
  const filas: Omit<CoberturaMacro, 'porcentaje' | 'diferencia'>[] = [
    { clave: 'kcal',           titulo: 'Energía',       unidad: 'kcal', actual: totales.energia,       objetivo: req.kcal },
    { clave: 'proteinas',      titulo: 'Proteínas',     unidad: 'g',    actual: totales.proteinas,     objetivo: req.proteinasG },
    { clave: 'carbohidratos',  titulo: 'Carbohidratos', unidad: 'g',    actual: totales.carbohidratos, objetivo: req.carbohidratosG },
    { clave: 'grasas',         titulo: 'Grasas',        unidad: 'g',    actual: totales.grasas,        objetivo: req.grasasG },
  ]

  return filas.map(f => ({
    ...f,
    porcentaje: f.objetivo > 0 ? Math.round((f.actual / f.objetivo) * 100) : 0,
    diferencia: redondear(f.actual - f.objetivo, 1),
  }))
}

/* ── Operaciones sobre la dieta (inmutables) ──────────────────── */

export function conDiaActualizado(
  dieta: Dieta,
  diaSemana: DiaSemana,
  actualizar: (dia: DiaDietaDetalle) => DiaDietaDetalle
): Dieta {
  return {
    ...dieta,
    dias: dieta.dias.map(d => (d.diaSemana === diaSemana ? actualizar(d) : d)),
  }
}

export function agregarAlimento(
  dieta: Dieta,
  diaSemana: DiaSemana,
  tiempoId: string,
  item: AlimentoEnDieta
): Dieta {
  return conDiaActualizado(dieta, diaSemana, dia => ({
    ...dia,
    tiempos: dia.tiempos.map(t =>
      t.id === tiempoId ? { ...t, alimentos: [...t.alimentos, item] } : t
    ),
  }))
}

export function cambiarGramos(
  dieta: Dieta,
  diaSemana: DiaSemana,
  tiempoId: string,
  itemId: string,
  gramos: number
): Dieta {
  return conDiaActualizado(dieta, diaSemana, dia => ({
    ...dia,
    tiempos: dia.tiempos.map(t =>
      t.id === tiempoId
        ? { ...t, alimentos: t.alimentos.map(a => (a.id === itemId ? { ...a, gramos } : a)) }
        : t
    ),
  }))
}

export function quitarAlimento(
  dieta: Dieta,
  diaSemana: DiaSemana,
  tiempoId: string,
  itemId: string
): Dieta {
  return conDiaActualizado(dieta, diaSemana, dia => ({
    ...dia,
    tiempos: dia.tiempos.map(t =>
      t.id === tiempoId ? { ...t, alimentos: t.alimentos.filter(a => a.id !== itemId) } : t
    ),
  }))
}

/** Copia el contenido de un día a otros, regenerando los ids de cada ítem. */
export function copiarDia(dieta: Dieta, origen: DiaSemana, destinos: DiaSemana[]): Dieta {
  const diaOrigen = dieta.dias.find(d => d.diaSemana === origen)
  if (!diaOrigen) return dieta

  return {
    ...dieta,
    dias: dieta.dias.map(d =>
      destinos.includes(d.diaSemana) && d.diaSemana !== origen
        ? {
            diaSemana: d.diaSemana,
            tiempos: diaOrigen.tiempos.map(t => ({
              id: nuevoId(),
              nombre: t.nombre,
              alimentos: t.alimentos.map(a => ({ ...a, id: nuevoId() })),
            })),
          }
        : d
    ),
  }
}

/* ── Lista de compras ─────────────────────────────────────────── */

/** Agrega los gramos de cada alimento en toda la semana, para el PDF. */
export function listaDeCompras(dieta: Dieta): { nombre: string; gramos: number; fuente: string }[] {
  const mapa = new Map<string, { nombre: string; gramos: number; fuente: string }>()

  for (const dia of dieta.dias) {
    for (const tiempo of dia.tiempos) {
      for (const item of tiempo.alimentos) {
        const previo = mapa.get(item.alimentoId)
        mapa.set(item.alimentoId, {
          nombre: item.nombre,
          fuente: item.fuente,
          gramos: (previo?.gramos ?? 0) + item.gramos,
        })
      }
    }
  }

  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
}

/* ── Intercambios SMAE ────────────────────────────────────────── */

/**
 * Gramos que equivalen a un intercambio SMAE por grupo de alimentos.
 * Permite capturar porciones en intercambios y convertirlas a gramos.
 */
export const GRAMOS_POR_INTERCAMBIO: Record<string, number> = {
  'Cereales y tubérculos': 30,
  'Leguminosas': 35,
  'Frutas': 120,
  'Verduras': 100,
  'Carnes y aves': 30,
  'Pescados y mariscos': 30,
  'Lácteos y huevos': 120,
  'Grasas y aceites': 5,
  'Azúcares': 10,
  'Bebidas': 200,
  'Varios': 50,
}

export function gramosDeIntercambios(categoria: string, intercambios: number): number {
  return Math.round((GRAMOS_POR_INTERCAMBIO[categoria] ?? 50) * intercambios)
}
