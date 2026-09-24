export type FuenteAlimento = 'TPCA' | 'SMAE' | 'USDA' | 'personalizado'

export type CategoriaAlimento =
  | 'Cereales y tubérculos'
  | 'Leguminosas'
  | 'Frutas'
  | 'Verduras'
  | 'Carnes y aves'
  | 'Pescados y mariscos'
  | 'Lácteos y huevos'
  | 'Grasas y aceites'
  | 'Azúcares'
  | 'Bebidas'
  | 'Varios'

export interface Alimento {
  id: string
  nombre: string
  fuente: FuenteAlimento
  categoria: CategoriaAlimento
  energia: number
  proteinas: number
  grasas: number
  carbohidratos: number
  fibra: number
  sodio?: number
  calcio?: number
  hierro?: number
  vitaminaC?: number
  esPersonalizado: boolean
  nutricionistaId?: string

  /**
   * Composición completa por 100 g, nutriente → valor, para los alimentos que
   * la traen (la tabla peruana aporta 22). Un nutriente en `null` significa
   * que la tabla no tiene el dato, no que valga cero.
   *
   * Opcional: las pantallas que solo usan macronutrientes la ignoran.
   */
  micronutrientes?: Record<string, number | null>
}

export interface PlatilloIngrediente {
  alimentoId: string
  alimentoNombre: string
  fuente: FuenteAlimento
  gramos: number
}

export interface NutrientesTotales {
  energia: number
  proteinas: number
  grasas: number
  carbohidratos: number
  fibra: number
}

export interface Platillo {
  id: string
  nombre: string
  descripcion?: string
  ingredientes: PlatilloIngrediente[]
  porciones: number
  creadoEn: string
}

export interface CrearAlimentoDto {
  nombre: string
  categoria: CategoriaAlimento
  energia: number
  proteinas: number
  grasas: number
  carbohidratos: number
  fibra: number
  sodio?: number
  calcio?: number
  hierro?: number
}

export interface CrearPlatilloDto {
  nombre: string
  descripcion?: string
  ingredientes: { alimentoId: string; gramos: number }[]
  porciones: number
}
