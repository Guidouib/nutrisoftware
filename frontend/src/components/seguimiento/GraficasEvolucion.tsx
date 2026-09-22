import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AdherenciaSemana, PuntoEvolucion } from '../../hooks/useSeguimiento'

const EJE = { fontSize: 11, fill: '#4F7361' }
const GRID = '#E4EAE6'

/** Marco común: alto 200 px en mobile y 300 px en desktop, fluido en ancho. */
function Marco({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-[200px] w-full min-w-0 md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

function Vacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex h-[200px] w-full items-center justify-center rounded-xl bg-canvas md:h-[300px]">
      <p className="max-w-xs px-6 text-center text-xs text-slate-500">{mensaje}</p>
    </div>
  )
}

const estiloTooltip = { borderRadius: 12, border: '1px solid #E4EAE6', fontSize: 12 }

/* ── a. Evolución del peso ───────────────────────────────────── */

export function GraficaPeso({
  puntos,
  pesoObjetivo,
}: {
  puntos: PuntoEvolucion[]
  pesoObjetivo: number | null
}) {
  if (puntos.length === 0) return <Vacio mensaje="Sin controles en el período seleccionado." />

  return (
    <Marco>
      <LineChart data={puntos} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="etiqueta" tick={EJE} stroke="#C9D5CC" />
        <YAxis
          tick={EJE}
          stroke="#C9D5CC"
          width={44}
          domain={['dataMin - 3', 'dataMax + 3']}
          unit=" kg"
        />
        <Tooltip
          contentStyle={estiloTooltip}
          formatter={valor => [`${Number(valor)} kg`, 'Peso']}
        />
        {pesoObjetivo !== null && (
          <ReferenceLine
            y={pesoObjetivo}
            stroke="#DC2626"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{ value: `Meta ${pesoObjetivo} kg`, position: 'insideTopRight', fontSize: 11, fill: '#DC2626' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="peso"
          stroke="#0D9F63"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#0D9F63', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </Marco>
  )
}

/* ── b. Evolución del IMC ────────────────────────────────────── */

/** Bandas de referencia OMS pintadas de fondo. */
const BANDAS_IMC = [
  { y1: 0,    y2: 18.5, color: '#FEF3C7', etiqueta: 'Bajo peso' },
  { y1: 18.5, y2: 25,   color: '#D2F4E4', etiqueta: 'Normal' },
  { y1: 25,   y2: 30,   color: '#FEF3C7', etiqueta: 'Sobrepeso' },
  { y1: 30,   y2: 60,   color: '#FEE2E2', etiqueta: 'Obesidad' },
]

export function GraficaImc({ puntos }: { puntos: PuntoEvolucion[] }) {
  const conImc = puntos.filter(p => p.imc !== null)
  if (conImc.length === 0) {
    return <Vacio mensaje="Registra la talla en algún control para calcular el IMC." />
  }

  const valores = conImc.map(p => p.imc as number)
  const min = Math.floor(Math.min(...valores) - 2)
  const max = Math.ceil(Math.max(...valores) + 2)

  return (
    <Marco>
      <LineChart data={conImc} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        {BANDAS_IMC.map(b => (
          <ReferenceArea key={b.etiqueta} y1={b.y1} y2={b.y2} fill={b.color} fillOpacity={0.55} ifOverflow="hidden" />
        ))}
        <XAxis dataKey="etiqueta" tick={EJE} stroke="#C9D5CC" />
        <YAxis tick={EJE} stroke="#C9D5CC" width={38} domain={[min, max]} />
        <Tooltip contentStyle={estiloTooltip} formatter={valor => [`${Number(valor)} kg/m²`, 'IMC']} />
        <Line
          type="monotone"
          dataKey="imc"
          stroke="#05613C"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#05613C', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </Marco>
  )
}

/* ── c. Perímetros por fecha ─────────────────────────────────── */

const SERIES_MEDIDAS = [
  { clave: 'perimetroAbdominal', nombre: 'Abdominal', color: '#0D9F63' },
  { clave: 'perimetroCintura',   nombre: 'Cintura',   color: '#2EB97D' },
  { clave: 'perimetroCadera',    nombre: 'Cadera',    color: '#68D5A8' },
  { clave: 'perimetroBrazo',     nombre: 'Brazo',     color: '#F59E0B' },
] as const

export function GraficaMedidas({ puntos }: { puntos: PuntoEvolucion[] }) {
  const activas = SERIES_MEDIDAS.filter(s => puntos.some(p => p[s.clave] !== undefined))
  if (activas.length === 0) {
    return <Vacio mensaje="Aún no se registran perímetros en los controles." />
  }

  return (
    <Marco>
      <BarChart data={puntos} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="etiqueta" tick={EJE} stroke="#C9D5CC" />
        <YAxis tick={EJE} stroke="#C9D5CC" width={44} unit=" cm" />
        <Tooltip contentStyle={estiloTooltip} formatter={valor => `${Number(valor)} cm`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {activas.map(s => (
          <Bar key={s.clave} dataKey={s.clave} name={s.nombre} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </Marco>
  )
}

/* ── e. Adherencia semanal ───────────────────────────────────── */

export function GraficaAdherencia({ semanas }: { semanas: AdherenciaSemana[] }) {
  if (semanas.length === 0) {
    return <Vacio mensaje="Sin datos de adherencia en el período seleccionado." />
  }

  return (
    <Marco>
      <BarChart data={semanas} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="semana" tick={EJE} stroke="#C9D5CC" />
        <YAxis tick={EJE} stroke="#C9D5CC" width={40} domain={[0, 100]} unit=" %" />
        <Tooltip
          contentStyle={estiloTooltip}
          formatter={valor => [`${Number(valor)} %`, 'Cumplimiento']}
        />
        <ReferenceLine y={80} stroke="#0D9F63" strokeDasharray="6 4" strokeWidth={1.5} />
        <Bar dataKey="promedio" name="Cumplimiento" fill="#0D9F63" radius={[6, 6, 0, 0]} />
      </BarChart>
    </Marco>
  )
}
