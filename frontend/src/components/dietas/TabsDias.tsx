import { Tabs } from '../ui/Tabs'
import { DIAS_SEMANA, estadoDia } from '../../lib/dieta'
import type { DiaDietaDetalle, DiaSemana, EstadoDia } from '../../types/dieta'

const colorPunto: Record<EstadoDia, string> = {
  completo: 'bg-primary-400',
  incompleto: 'bg-accent-400',
  vacio: 'bg-slate-300',
}

const etiquetaEstado: Record<EstadoDia, string> = {
  completo: 'día completo',
  incompleto: 'día incompleto',
  vacio: 'día vacío',
}

interface TabsDiasProps {
  dias: DiaDietaDetalle[]
  diaActivo: DiaSemana
  onCambiar: (dia: DiaSemana) => void
}

export function TabsDias({ dias, diaActivo, onCambiar }: TabsDiasProps) {
  const items = DIAS_SEMANA.map(d => {
    const dia = dias.find(x => x.diaSemana === d.valor)
    const estado: EstadoDia = dia ? estadoDia(dia) : 'vacio'
    return {
      value: String(d.valor),
      label: d.corto,
      badge: (
        <span
          className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${colorPunto[estado]}`}
          title={`${d.largo}: ${etiquetaEstado[estado]}`}
          aria-label={etiquetaEstado[estado]}
        />
      ),
    }
  })

  return (
    <Tabs
      aria-label="Día de la semana"
      items={items}
      value={String(diaActivo)}
      onChange={v => onCambiar(Number(v) as DiaSemana)}
    />
  )
}
