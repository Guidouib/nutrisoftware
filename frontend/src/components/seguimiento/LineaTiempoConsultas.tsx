import { SemaforoBadge } from '../evaluacion/SemaforoBadge'
import { ETIQUETAS_CUMPLIMIENTO, type ControlSeguimiento } from '../../types/seguimiento'

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
}

function IconoCalendario() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 1.5v2M9 1.5v2M1.5 5.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function nivelCumplimiento(valor: number) {
  if (valor >= 4) return 'optimo' as const
  if (valor === 3) return 'precaucion' as const
  return 'critico' as const
}

interface LineaTiempoConsultasProps {
  /** Controles del más reciente al más antiguo. */
  controles: ControlSeguimiento[]
}

export function LineaTiempoConsultas({ controles }: LineaTiempoConsultasProps) {
  if (controles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-10 text-center">
        <p className="text-lg font-bold text-slate-800">Sin controles registrados</p>
        <p className="text-xs text-slate-500">Registra la primera consulta de control para ver la evolución.</p>
      </div>
    )
  }

  return (
    <ol className="ml-2 flex flex-col border-l-2 border-primary-500 pl-6">
      {controles.map((c, i) => {
        // El anterior en el tiempo está una posición más adelante en la lista.
        const previo = controles[i + 1]
        const delta = previo ? Math.round((c.peso - previo.peso) * 10) / 10 : null

        return (
          <li key={c.id} className="relative pb-7 last:pb-0">
            <span
              className="absolute -left-[2.1rem] flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white ring-4 ring-white"
              aria-hidden
            >
              <IconoCalendario />
            </span>

            <div className="min-w-0 rounded-xl border border-border bg-canvas p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-800">{formatoFecha(c.fecha)}</p>
                  <p className="text-xs text-slate-500">
                    {ETIQUETAS_CUMPLIMIENTO[c.cumplimiento] ?? 'Sin registro de adherencia'}
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  {delta !== null && delta !== 0 && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${
                        delta < 0 ? 'text-primary-600' : 'text-accent-600'
                      }`}
                    >
                      {delta < 0 ? '↓' : '↑'} {Math.abs(delta)} kg
                    </span>
                  )}
                  <SemaforoBadge size="sm" nivel={nivelCumplimiento(c.cumplimiento)}>
                    {c.peso} kg
                  </SemaforoBadge>
                </div>
              </div>

              {(c.medidas.perimetroAbdominal ||
                c.medidas.perimetroCintura ||
                c.medidas.perimetroCadera ||
                c.medidas.perimetroBrazo) && (
                <div className="mt-3 flex flex-wrap gap-4">
                  {[
                    { etiqueta: 'Abdominal', valor: c.medidas.perimetroAbdominal },
                    { etiqueta: 'Cintura', valor: c.medidas.perimetroCintura },
                    { etiqueta: 'Cadera', valor: c.medidas.perimetroCadera },
                    { etiqueta: 'Brazo', valor: c.medidas.perimetroBrazo },
                  ]
                    .filter(m => m.valor !== undefined)
                    .map(m => (
                      <span key={m.etiqueta} className="text-xs text-slate-500">
                        {m.etiqueta}{' '}
                        <span className="font-semibold tabular-nums text-slate-800">{m.valor} cm</span>
                      </span>
                    ))}
                </div>
              )}

              {c.observaciones && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{c.observaciones}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
