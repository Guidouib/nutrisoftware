import { AccordionItem } from '../ui/Accordion'
import { TablaAlimentos } from './TablaAlimentos'
import { totalesDeTiempo } from '../../lib/dieta'
import type { TiempoComidaDieta } from '../../types/dieta'

interface TiempoComidaSectionProps {
  tiempo: TiempoComidaDieta
  onAgregar: (tiempoId: string) => void
  onCambiarGramos: (tiempoId: string, itemId: string, gramos: number) => void
  onQuitar: (tiempoId: string, itemId: string) => void
  defaultOpen?: boolean
}

export function TiempoComidaSection({
  tiempo,
  onAgregar,
  onCambiarGramos,
  onQuitar,
  defaultOpen,
}: TiempoComidaSectionProps) {
  const totales = totalesDeTiempo(tiempo)
  const vacio = tiempo.alimentos.length === 0

  return (
    <AccordionItem
      title={tiempo.nombre}
      subtitle={vacio ? 'Sin alimentos asignados' : `${tiempo.alimentos.length} alimento(s)`}
      defaultOpen={defaultOpen}
      right={
        <div className="hidden items-center gap-4 sm:flex">
          {[
            { etiqueta: 'kcal', valor: totales.energia },
            { etiqueta: 'P', valor: totales.proteinas },
            { etiqueta: 'C', valor: totales.carbohidratos },
            { etiqueta: 'G', valor: totales.grasas },
          ].map(t => (
            <div key={t.etiqueta} className="text-right">
              <p className={`text-sm font-bold tabular-nums ${vacio ? 'text-slate-400' : 'text-slate-800'}`}>
                {t.valor}
              </p>
              <p className="text-[11px] text-slate-500">{t.etiqueta}</p>
            </div>
          ))}
        </div>
      }
    >
      <TablaAlimentos
        alimentos={tiempo.alimentos}
        onCambiarGramos={(itemId, gramos) => onCambiarGramos(tiempo.id, itemId, gramos)}
        onQuitar={itemId => onQuitar(tiempo.id, itemId)}
      />

      <button
        type="button"
        onClick={() => onAgregar(tiempo.id)}
        className="mt-4 rounded-xl border border-border bg-white px-3 py-2 text-[13px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
      >
        + Agregar alimento
      </button>
    </AccordionItem>
  )
}
