import { nutrientesDe } from '../../lib/dieta'
import type { AlimentoEnDieta } from '../../types/dieta'
import type { FuenteAlimento } from '../../types/alimento'

/** Chip de fuente: TPCA verde, SMAE azul, USDA gris, personalizado ámbar. */
const estiloFuente: Record<FuenteAlimento, string> = {
  TPCA: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',
  SMAE: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  USDA: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  personalizado: 'bg-accent-50 text-accent-600 ring-1 ring-amber-200',
}

const etiquetaFuente: Record<FuenteAlimento, string> = {
  TPCA: 'TPCA',
  SMAE: 'SMAE',
  USDA: 'USDA',
  personalizado: 'Personal',
}

export function ChipFuente({ fuente }: { fuente: FuenteAlimento }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${estiloFuente[fuente]}`}>
      {etiquetaFuente[fuente]}
    </span>
  )
}

interface TablaAlimentosProps {
  alimentos: AlimentoEnDieta[]
  onCambiarGramos: (itemId: string, gramos: number) => void
  onQuitar: (itemId: string) => void
}

export function TablaAlimentos({ alimentos, onCambiarGramos, onQuitar }: TablaAlimentosProps) {
  if (alimentos.length === 0) {
    return (
      <p className="py-4 text-xs text-slate-500">
        Sin alimentos en este tiempo de comida.
      </p>
    )
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {['Alimento', 'Fuente', 'Cantidad', 'Kcal', 'Prot', 'Carb', 'Gras', ''].map(h => (
              <th
                key={h}
                scope="col"
                className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alimentos.map(item => {
            const n = nutrientesDe(item)
            return (
              <tr key={item.id} className="border-b border-slate-50 last:border-0">
                <td className="min-w-0 max-w-[16rem] px-3 py-2 text-slate-800">
                  <span className="block truncate">{item.nombre}</span>
                </td>
                <td className="min-w-0 px-3 py-2">
                  <ChipFuente fuente={item.fuente} />
                </td>
                <td className="min-w-0 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="5"
                      value={item.gramos}
                      aria-label={`Cantidad de ${item.nombre} en gramos`}
                      onChange={e => onCambiarGramos(item.id, Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 w-20 rounded-lg border border-border bg-white px-2 text-[13px] tabular-nums focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <span className="text-xs text-slate-500">g</span>
                  </div>
                </td>
                <td className="min-w-0 px-3 py-2 font-semibold tabular-nums text-slate-800">{n.energia}</td>
                <td className="min-w-0 px-3 py-2 tabular-nums text-slate-500">{n.proteinas}</td>
                <td className="min-w-0 px-3 py-2 tabular-nums text-slate-500">{n.carbohidratos}</td>
                <td className="min-w-0 px-3 py-2 tabular-nums text-slate-500">{n.grasas}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onQuitar(item.id)}
                    aria-label={`Quitar ${item.nombre}`}
                    className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
