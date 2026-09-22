import { z } from 'zod'
import { camposDeNivel } from '../lib/antropometria'
import type { NivelISAK } from '../types/evaluacion'

/* ────────────────────────────────────────────────────────────────
   Los inputs numéricos se registran con `valueAsNumber`, así que un
   campo vacío llega como `NaN`. `medida()` lo normaliza a
   `undefined` para que un campo en blanco no dispare el error de
   tipo "esperaba número" sino el mensaje de requerido correcto.
   ──────────────────────────────────────────────────────────────── */

const vacio = (v: unknown) =>
  v === '' || v === null || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v

function medida(max: number) {
  return z.preprocess(
    vacio,
    z.number().positive('Debe ser mayor a 0').max(max, `Máximo ${max}`).optional()
  )
}

/* ── Antropometría ISAK ───────────────────────────────────────── */

/**
 * El esquema depende del nivel elegido: los campos del nivel activo son
 * obligatorios y los demás quedan opcionales. Se regenera al cambiar de
 * nivel y se pasa al `zodResolver` de React Hook Form.
 */
export function esquemaAntropometria(nivel: NivelISAK) {
  const campos = camposDeNivel(nivel)

  const forma: Record<string, z.ZodTypeAny> = {}
  for (const c of campos) forma[c.id] = medida(c.max)

  return z
    .object({
      fecha: z.string().min(1, 'Selecciona la fecha de la medición'),
      observaciones: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
      medidas: z.object(forma),
    })
    .superRefine((valores, ctx) => {
      for (const c of campos) {
        if (valores.medidas[c.id] === undefined) {
          ctx.addIssue({ code: 'custom', message: 'Requerido', path: ['medidas', c.id] })
        }
      }
    })
}

export type FormAntropometria = {
  fecha: string
  observaciones?: string
  medidas: Record<string, number | undefined>
}

/* ── Evaluación Niño ──────────────────────────────────────────── */

export const esquemaNino = z.object({
  fecha: z.string().min(1, 'Selecciona la fecha'),
  peso: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(80, 'Máximo 80')),
  talla: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(180, 'Máximo 180')),
  perimetroCefalico: medida(70),
  prescripcion: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
})
export type FormNino = z.input<typeof esquemaNino>

/* ── Evaluación Adolescente ───────────────────────────────────── */

export const esquemaAdolescente = z.object({
  fecha: z.string().min(1, 'Selecciona la fecha'),
  peso: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(200, 'Máximo 200')),
  talla: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(230, 'Máximo 230')),
  tanner: z.enum(['I', 'II', 'III', 'IV', 'V']),
  prescripcion: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
})
export type FormAdolescente = z.input<typeof esquemaAdolescente>

/* ── Evaluación Embarazada ────────────────────────────────────── */

export const esquemaEmbarazada = z.object({
  fecha: z.string().min(1, 'Selecciona la fecha'),
  pesoPregestacional: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(250, 'Máximo 250')),
  talla: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(230, 'Máximo 230')),
  pesoActual: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(250, 'Máximo 250')),
  semanasGestacion: z.number().int().min(1, 'Mínimo 1').max(42, 'Máximo 42'),
  alturaUterinaMedida: medida(50),
  prescripcion: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
})
export type FormEmbarazada = z.input<typeof esquemaEmbarazada>

/* ── Seguimiento ──────────────────────────────────────────────── */

export const esquemaControl = z.object({
  fecha: z.string().min(1, 'Selecciona la fecha'),
  peso: z.preprocess(vacio, z.number().positive('Debe ser mayor a 0').max(400, 'Máximo 400')),
  talla: medida(260),
  perimetroAbdominal: medida(200),
  perimetroCintura: medida(200),
  perimetroCadera: medida(200),
  perimetroBrazo: medida(80),
  cumplimiento: z.number().int().min(1).max(5),
  observaciones: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
})
export type FormControl = z.input<typeof esquemaControl>
