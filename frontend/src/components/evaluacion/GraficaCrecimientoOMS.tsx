import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ETIQUETA_INDICADOR, PERCENTILES, valorEnZ, type IndicadorOms } from '../../lib/oms'
import type { Sexo } from '../../types/evaluacion'

const COLOR_PERCENTIL: Record<number, string> = {
  3: '#FCA5A5',
  15: '#FCD34D',
  50: '#0D9F63',
  85: '#FCD34D',
  97: '#FCA5A5',
}

interface GraficaCrecimientoOMSProps {
  indicador: IndicadorOms
  sexo: Sexo
  /** Edad en meses, o talla en cm cuando el indicador es `pesoTalla`. */
  x: number
  /** Medida del paciente en el eje Y. */
  valor: number | null
  /** Rango del eje X. Por defecto 0–132 meses (0–11 años). */
  rangoX?: [number, number]
}

export function GraficaCrecimientoOMS({
  indicador,
  sexo,
  x,
  valor,
  rangoX,
}: GraficaCrecimientoOMSProps) {
  const esPesoTalla = indicador === 'pesoTalla'
  const [xMin, xMax] = rangoX ?? (esPesoTalla ? [65, 120] : [0, 132])

  // Una fila por paso del eje X con el valor de cada percentil.
  const datos = useMemo(() => {
    const paso = esPesoTalla ? 5 : 3
    const filas: Record<string, number | null>[] = []

    for (let punto = xMin; punto <= xMax; punto += paso) {
      const fila: Record<string, number | null> = { x: punto }
      for (const { p, z } of PERCENTILES) fila[`p${p}`] = valorEnZ(indicador, sexo, punto, z)
      filas.push(fila)
    }
    return filas
  }, [indicador, sexo, xMin, xMax, esPesoTalla])

  const puntoPaciente = valor !== null && x >= xMin && x <= xMax ? [{ x, valor }] : []

  const unidadY = indicador === 'tallaEdad' ? ' cm' : indicador === 'imcEdad' ? '' : ' kg'
  const etiquetaX = esPesoTalla ? 'Talla (cm)' : 'Edad (meses)'

  return (
    <div className="h-[200px] w-full min-w-0 md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 12, right: 16, bottom: 14, left: 0 }}>
          <CartesianGrid stroke="#E4EAE6" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[xMin, xMax]}
            tick={{ fontSize: 11, fill: '#4F7361' }}
            stroke="#C9D5CC"
            label={{ value: etiquetaX, position: 'insideBottom', offset: -6, fontSize: 11, fill: '#4F7361' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#4F7361' }}
            stroke="#C9D5CC"
            width={44}
            unit={unidadY}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E4EAE6', fontSize: 12 }}
            labelFormatter={v => `${etiquetaX}: ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />

          {PERCENTILES.map(({ p }) => (
            <Line
              key={p}
              type="monotone"
              dataKey={`p${p}`}
              name={`P${p}`}
              stroke={COLOR_PERCENTIL[p]}
              strokeWidth={p === 50 ? 2 : 1.4}
              strokeDasharray={p === 50 ? undefined : '5 4'}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          ))}

          {puntoPaciente.length > 0 && (
            <Scatter
              name={ETIQUETA_INDICADOR[indicador]}
              data={puntoPaciente}
              dataKey="valor"
              fill="#05613C"
              shape="circle"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
