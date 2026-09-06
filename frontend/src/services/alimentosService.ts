import { api } from './api'
import type { Alimento, FuenteAlimento, CategoriaAlimento } from '../types/alimento'

interface AlimentoApi {
  id: string
  nombre: string
  fuente: string
  categoria?: string
  energia: number
  proteinas: number
  grasas: number
  carbohidratos: number
  fibra: number
  sodio?: number
  calcio?: number
  hierro?: number
  esPersonalizado: boolean
  fechaCreacion: string
}

function mapFuente(f: string): FuenteAlimento {
  if (f === 'Personalizado') return 'personalizado'
  return f as FuenteAlimento
}

function mapAlimento(a: AlimentoApi): Alimento {
  return {
    id:             a.id,
    nombre:         a.nombre,
    fuente:         mapFuente(a.fuente),
    categoria:      (a.categoria ?? 'Varios') as CategoriaAlimento,
    energia:        a.energia,
    proteinas:      a.proteinas,
    grasas:         a.grasas,
    carbohidratos:  a.carbohidratos,
    fibra:          a.fibra,
    sodio:          a.sodio,
    calcio:         a.calcio,
    hierro:         a.hierro,
    esPersonalizado: a.esPersonalizado,
  }
}

export const alimentosService = {
  async getAll(fuente?: string, categoria?: string, busqueda?: string): Promise<Alimento[]> {
    const params: Record<string, string> = {}
    if (fuente && fuente !== 'todos') {
      params.fuente = fuente === 'personalizado' ? 'Personalizado' : fuente
    }
    if (categoria && categoria !== 'todas') params.categoria = categoria
    if (busqueda) params.busqueda = busqueda
    const { data } = await api.get<AlimentoApi[]>('/alimentos', { params })
    return data.map(mapAlimento)
  },

  async create(dto: {
    nombre: string
    categoria?: string
    energia: number
    proteinas: number
    grasas: number
    carbohidratos: number
    fibra: number
    sodio?: number
    calcio?: number
    hierro?: number
  }): Promise<Alimento> {
    const { data } = await api.post<AlimentoApi>('/alimentos', dto)
    return mapAlimento(data)
  },

  async eliminar(id: string): Promise<void> {
    await api.delete(`/alimentos/${id}`)
  },
}
