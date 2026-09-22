/* ────────────────────────────────────────────────────────────────
   REPOSITORIO LOCAL DE RESPALDO

   Los módulos de Evaluación, Dieta, Seguimiento y Reportes todavía
   no tienen controladores en el backend (solo existen Alimentos,
   Citas, Dashboard y Pacientes).

   Cada service intenta primero la ruta REST real; si el endpoint
   aún no existe (404/405) o la red falla, cae a este repositorio
   sobre localStorage. Cuando los controladores se publiquen, la
   rama de fallback deja de ejecutarse sola: no hay que tocar ni
   los services ni los hooks.
   ──────────────────────────────────────────────────────────────── */

const PREFIX = 'nutrisoftware:'

/** `true` cuando el endpoint todavía no existe o no hubo respuesta del servidor. */
export function endpointNoDisponible(error: unknown): boolean {
  const status = (error as { response?: { status?: number } } | null)?.response?.status
  // Sin `response` = error de red / servidor caído → también usamos el respaldo.
  return status === undefined || status === 404 || status === 405 || status === 501
}

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = localStorage.getItem(PREFIX + clave)
    return crudo === null ? porDefecto : (JSON.parse(crudo) as T)
  } catch {
    return porDefecto
  }
}

function escribir<T>(clave: string, valor: T): T {
  try {
    localStorage.setItem(PREFIX + clave, JSON.stringify(valor))
  } catch {
    /* cuota llena o modo privado: la UI sigue funcionando en memoria */
  }
  return valor
}

export const localRepo = {
  leer,
  escribir,

  /** Lista completa guardada bajo una clave. */
  lista<T>(clave: string): T[] {
    return leer<T[]>(clave, [])
  },

  /** Inserta al principio y devuelve el elemento insertado. */
  agregar<T>(clave: string, item: T): T {
    escribir(clave, [item, ...leer<T[]>(clave, [])])
    return item
  },

  /** Reemplaza el elemento cuyo `id` coincida; lo agrega si no existía. */
  guardar<T extends { id: string }>(clave: string, item: T): T {
    const actual = leer<T[]>(clave, [])
    const idx = actual.findIndex(x => x.id === item.id)
    if (idx === -1) escribir(clave, [item, ...actual])
    else escribir(clave, actual.map((x, i) => (i === idx ? item : x)))
    return item
  },

  eliminar(clave: string, id: string): void {
    escribir(clave, leer<{ id: string }[]>(clave, []).filter(x => x.id !== id))
  },
}

/** Id local estable — `crypto.randomUUID` con respaldo para contextos no seguros. */
export function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `local-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}
