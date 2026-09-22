import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { Somatotipo } from '../../types/evaluacion'

/* Vértices de la somatocarta de Heath-Carter.
   Se obtienen de los somatotipos extremos (7-1-1, 1-7-1 y 1-1-7)
   aplicando x = ecto − endo  ·  y = 2·meso − (endo + ecto). */
const POLO_ENDO = { x: -6, y: -6 }
const POLO_MESO = { x: 0, y: 12 }
const POLO_ECTO = { x: 6, y: -6 }

interface PuntoCarta {
  x: number
  y: number
  etiqueta: string
  categoria: string
  componentes: string
}

interface SomatocartaChartProps {
  /** Somatotipo de la medición en curso. */
  actual: Somatotipo | null
  /** Mediciones anteriores, para ver el desplazamiento en el tiempo. */
  historico?: { somatotipo: Somatotipo; fecha: string }[]
}

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function componentes(s: Somatotipo): string {
  return `${s.endomorfia} – ${s.mesomorfia} – ${s.ectomorfia}`
}

function TooltipCarta({ active, payload }: { active?: boolean; payload?: { payload: PuntoCarta }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-bold text-slate-800">{p.etiqueta}</p>
      <p className="text-xs text-slate-500">{p.categoria}</p>
      <p className="mt-1 text-[11px] font-mono text-slate-500">Endo – Meso – Ecto: {p.componentes}</p>
    </div>
  )
}

export function SomatocartaChart({ actual, historico = [] }: SomatocartaChartProps) {
  const puntosHistoricos: PuntoCarta[] = historico.map(h => ({
    x: h.somatotipo.x,
    y: h.somatotipo.y,
    etiqueta: formatoFecha(h.fecha),
    categoria: h.somatotipo.categoria,
    componentes: componentes(h.somatotipo),
  }))

  const puntoActual: PuntoCarta[] = actual
    ? [{
        x: actual.x,
        y: actual.y,
        etiqueta: 'Medición actual',
        categoria: actual.categoria,
        componentes: componentes(actual),
      }]
    : []

  if (!actual && puntosHistoricos.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-xl bg-canvas md:h-[300px]">
        <p className="max-w-xs px-6 text-center text-xs text-slate-500">
          Completa pliegues, diámetros y perímetros del nivel 1 para calcular el somatotipo.
        </p>
      </div>
    )
  }

  return (
    <div className="h-[200px] w-full min-w-0 md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#E4EAE6" strokeDasharray="3 3" />

          {/* Triángulo de referencia */}
          <ReferenceLine segment={[POLO_ENDO, POLO_MESO]} stroke="#C9D5CC" strokeWidth={1.5} ifOverflow="extendDomain" />
          <ReferenceLine segment={[POLO_MESO, POLO_ECTO]} stroke="#C9D5CC" strokeWidth={1.5} ifOverflow="extendDomain" />
          <ReferenceLine segment={[POLO_ECTO, POLO_ENDO]} stroke="#C9D5CC" strokeWidth={1.5} ifOverflow="extendDomain" />

          <XAxis
            type="number"
            dataKey="x"
            domain={[-8, 8]}
            ticks={[-8, -4, 0, 4, 8]}
            tick={{ fontSize: 11, fill: '#4F7361' }}
            stroke="#C9D5CC"
            label={{ value: 'Ecto − Endo', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#4F7361' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[-8, 14]}
            ticks={[-8, -4, 0, 4, 8, 12]}
            tick={{ fontSize: 11, fill: '#4F7361' }}
            stroke="#C9D5CC"
            width={38}
          />
          <ZAxis range={[70, 70]} />
          <Tooltip content={<TooltipCarta />} cursor={{ strokeDasharray: '3 3' }} />

          {puntosHistoricos.length > 0 && (
            <Scatter name="Mediciones previas" data={puntosHistoricos} fill="#A5E9CA" />
          )}
          {puntoActual.length > 0 && (
            <Scatter name="Medición actual" data={puntoActual} fill="#0D9F63" />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
