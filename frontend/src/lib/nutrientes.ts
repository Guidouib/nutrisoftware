/* ────────────────────────────────────────────────────────────────
   CATÁLOGO DE NUTRIENTES

   Réplica de `backend/src/NutriSoftware.Domain/Nutrientes.cs`. Las claves
   tienen que coincidir exactamente: son las que viajan en los JSON de
   composición, tanto al leer el catálogo de alimentos como al guardar un
   recordatorio.

   Si se agrega un nutriente, va en los dos lados.
   ──────────────────────────────────────────────────────────────── */

export interface Nutriente {
  clave: string
  etiqueta: string
  unidad: string
  decimales: number
  /** Los que se muestran en la tira de resumen sin desplegar el detalle. */
  destacado?: boolean
}

export const NUTRIENTES: Nutriente[] = [
  { clave: 'energiaKcal',       etiqueta: 'Energía',                   unidad: 'kcal', decimales: 0, destacado: true },
  { clave: 'energiaKj',         etiqueta: 'Energía',                   unidad: 'kJ',   decimales: 0 },
  { clave: 'agua',              etiqueta: 'Agua',                      unidad: 'g',    decimales: 1 },
  { clave: 'proteinas',         etiqueta: 'Proteínas',                 unidad: 'g',    decimales: 1, destacado: true },
  { clave: 'grasaTotal',        etiqueta: 'Grasa total',               unidad: 'g',    decimales: 1, destacado: true },
  { clave: 'carbohidratosTot',  etiqueta: 'Carbohidratos totales',     unidad: 'g',    decimales: 1, destacado: true },
  { clave: 'carbohidratosDisp', etiqueta: 'Carbohidratos disponibles', unidad: 'g',    decimales: 1 },
  { clave: 'fibra',             etiqueta: 'Fibra dietaria',            unidad: 'g',    decimales: 1, destacado: true },
  { clave: 'cenizas',           etiqueta: 'Cenizas',                   unidad: 'g',    decimales: 1 },
  { clave: 'calcio',            etiqueta: 'Calcio',                    unidad: 'mg',   decimales: 1 },
  { clave: 'fosforo',           etiqueta: 'Fósforo',                   unidad: 'mg',   decimales: 1 },
  { clave: 'zinc',              etiqueta: 'Zinc',                      unidad: 'mg',   decimales: 2 },
  { clave: 'hierro',            etiqueta: 'Hierro',                    unidad: 'mg',   decimales: 2, destacado: true },
  { clave: 'betaCaroteno',      etiqueta: 'β caroteno equivalentes',   unidad: 'µg',   decimales: 1 },
  { clave: 'vitaminaA',         etiqueta: 'Vitamina A equivalentes',   unidad: 'µg',   decimales: 1 },
  { clave: 'tiamina',           etiqueta: 'Tiamina',                   unidad: 'mg',   decimales: 2 },
  { clave: 'riboflavina',       etiqueta: 'Riboflavina',               unidad: 'mg',   decimales: 2 },
  { clave: 'niacina',           etiqueta: 'Niacina',                   unidad: 'mg',   decimales: 2 },
  { clave: 'vitaminaC',         etiqueta: 'Vitamina C',                unidad: 'mg',   decimales: 1 },
  { clave: 'acidoFolico',       etiqueta: 'Ácido fólico',              unidad: 'µg',   decimales: 1 },
  { clave: 'sodio',             etiqueta: 'Sodio',                     unidad: 'mg',   decimales: 1 },
  { clave: 'potasio',           etiqueta: 'Potasio',                   unidad: 'mg',   decimales: 1 },
]

export const NUTRIENTES_DESTACADOS = NUTRIENTES.filter(n => n.destacado)

/** Descomposición del hierro. No viene de la tabla: la calcula el servidor. */
export const HIERRO_DESGLOSE: Nutriente[] = [
  { clave: 'hierroHemo',   etiqueta: 'Hierro hemo (animal)',     unidad: 'mg', decimales: 2 },
  { clave: 'hierroNoHemo', etiqueta: 'Hierro no hemo (vegetal)', unidad: 'mg', decimales: 2 },
  { clave: 'hierroMixto',  etiqueta: 'Hierro sin atribuir',      unidad: 'mg', decimales: 2 },
]

export type OrigenAlimento = 'Animal' | 'Vegetal' | 'Mixto'

/**
 * Origen del hierro según la categoría del alimento.
 *
 * El Excel obligaba a marcar Animal o Vegetal a mano en cada carga, sin
 * valor por defecto y sin relación con el alimento elegido. Acá sale de la
 * categoría y se puede corregir puntualmente.
 *
 * Las preparaciones quedan en «Mixto»: un segundo con carne y arroz aporta
 * hierro hemo y no hemo a la vez, y asignarlo a uno solo sería inventar.
 */
const ORIGEN_POR_CATEGORIA: Record<string, OrigenAlimento> = {
  'Carnes y derivados':             'Animal',
  'Pescados y mariscos':            'Animal',
  'Leche y derivados':              'Animal',
  'Huevos':                         'Animal',
  'Fórmulas y papillas infantiles': 'Animal',
  'Sopas y entradas':               'Mixto',
  'Segundos y platos preparados':   'Mixto',
}

export function origenPorCategoria(categoria?: string | null): OrigenAlimento {
  if (!categoria) return 'Vegetal'
  return ORIGEN_POR_CATEGORIA[categoria] ?? 'Vegetal'
}

/**
 * Formatea un valor respetando la distinción entre «sin dato» y cero.
 * La tabla peruana tiene 5.009 celdas sin dato sobre 41.140, así que
 * mostrarlas como 0 sería afirmar algo que la tabla no dice.
 */
export function formatearNutriente(valor: number | null | undefined, n: Nutriente): string {
  if (valor === null || valor === undefined) return '—'
  return valor.toFixed(n.decimales)
}

export function buscarNutriente(clave: string): Nutriente | undefined {
  return NUTRIENTES.find(n => n.clave === clave)
    ?? HIERRO_DESGLOSE.find(n => n.clave === clave)
}
