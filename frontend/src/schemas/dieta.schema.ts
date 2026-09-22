import { z } from 'zod'

/* ── Alta de un alimento desde el buscador ────────────────────── */

export const esquemaAgregarAlimento = z.object({
  alimentoId: z.string().min(1, 'Selecciona un alimento'),
  gramos: z
    .number({ error: 'Ingresa la cantidad' })
    .positive('Debe ser mayor a 0')
    .max(2000, 'Máximo 2000 g'),
})
export type FormAgregarAlimento = z.infer<typeof esquemaAgregarAlimento>

/* ── Cabecera de la dieta ─────────────────────────────────────── */

export const esquemaDatosDieta = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
  fecha: z.string().min(1, 'Selecciona la fecha'),
})
export type FormDatosDieta = z.infer<typeof esquemaDatosDieta>

/* ── Forma persistida ─────────────────────────────────────────── */

const esquemaAlimentoEnDieta = z.object({
  id: z.string(),
  alimentoId: z.string(),
  nombre: z.string(),
  fuente: z.enum(['TPCA', 'SMAE', 'USDA', 'personalizado']),
  gramos: z.number().nonnegative(),
  energia100: z.number().nonnegative(),
  proteinas100: z.number().nonnegative(),
  grasas100: z.number().nonnegative(),
  carbohidratos100: z.number().nonnegative(),
  fibra100: z.number().nonnegative(),
})

const esquemaTiempoComida = z.object({
  id: z.string(),
  nombre: z.string(),
  alimentos: z.array(esquemaAlimentoEnDieta),
})

const esquemaDiaDieta = z.object({
  diaSemana: z.number().int().min(0).max(6),
  tiempos: z.array(esquemaTiempoComida),
})

/**
 * Valida lo que llega del backend o de localStorage antes de montarlo en la
 * UI: una dieta corrupta rompería todos los cálculos de totales.
 */
export const esquemaDieta = z.object({
  id: z.string(),
  pacienteId: z.string(),
  fecha: z.string(),
  nombre: z.string(),
  requerimientos: z.object({
    kcal: z.number().nonnegative(),
    proteinasG: z.number().nonnegative(),
    carbohidratosG: z.number().nonnegative(),
    grasasG: z.number().nonnegative(),
  }),
  dias: z.array(esquemaDiaDieta),
  modoIntercambios: z.boolean(),
})
