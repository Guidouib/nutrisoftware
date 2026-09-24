/* ────────────────────────────────────────────────────────────────
   CÁLCULO DE APORTES Y TOTALES

   Espejo de `CalculadoraConsumo.cs`. El servidor sigue siendo la fuente de
   verdad —recalcula todo al guardar— pero la pantalla de carga necesita que
   el total se mueva mientras se tipean los gramos, no dos segundos después
   de que termine el autoguardado.

   La regla que ambos lados comparten: un nutriente sin dato NO suma como
   cero, y se cuenta aparte para poder avisar que el total está incompleto.
   ──────────────────────────────────────────────────────────────── */

import { NUTRIENTES, type OrigenAlimento } from './nutrientes'
import type { ItemConsumo, MapaNutrientes, TotalesConsumo } from '../types/consumo'

function redondear(valor: number, decimales: number): number {
  const f = 10 ** decimales
  return Math.round(valor * f) / f
}

/** Composición por 100 g llevada a los gramos declarados. */
export function calcularAporte(composicion: MapaNutrientes, gramos: number): MapaNutrientes {
  const factor = gramos / 100
  const aporte: MapaNutrientes = {}

  for (const n of NUTRIENTES) {
    const valor = composicion[n.clave]
    aporte[n.clave] =
      valor === null || valor === undefined ? null : redondear(valor * factor, n.decimales)
  }

  return aporte
}

type ItemCalculable = Pick<ItemConsumo, 'aporte' | 'origenAlimento'>

export function calcularTotales(items: ItemCalculable[]): TotalesConsumo {
  const valores: Record<string, number> = {}
  const itemsSinDato: Record<string, number> = {}

  for (const n of NUTRIENTES) {
    let suma = 0
    let faltan = 0

    for (const item of items) {
      const v = item.aporte[n.clave]
      if (v === null || v === undefined) faltan += 1
      else suma += v
    }

    valores[n.clave] = redondear(suma, n.decimales)
    itemsSinDato[n.clave] = faltan
  }

  const hierro: Record<OrigenAlimento, number> = { Animal: 0, Vegetal: 0, Mixto: 0 }
  let hierroFaltante = 0

  for (const item of items) {
    const fe = item.aporte.hierro
    if (fe === null || fe === undefined) {
      hierroFaltante += 1
      continue
    }
    hierro[item.origenAlimento] += fe
  }

  valores.hierroHemo = redondear(hierro.Animal, 2)
  valores.hierroNoHemo = redondear(hierro.Vegetal, 2)
  valores.hierroMixto = redondear(hierro.Mixto, 2)
  itemsSinDato.hierroHemo = hierroFaltante
  itemsSinDato.hierroNoHemo = hierroFaltante
  itemsSinDato.hierroMixto = hierroFaltante

  return { valores, itemsSinDato, totalItems: items.length }
}

/** Fecha de hoy en el formato `yyyy-MM-dd` que espera el backend. */
export function hoyIso(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}
