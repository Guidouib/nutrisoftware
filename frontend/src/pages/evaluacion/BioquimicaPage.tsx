import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Accordion, AccordionItem } from '../../components/ui/Accordion'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import {
  etiquetaNivel,
  GRUPOS_BIOQUIMICA,
  interpretarValor,
  PARAMETROS_BIOQUIMICOS,
  parametroPorId,
  textoRango,
  type ParametroBioquimico,
} from '../../lib/bioquimica'
import { useBioquimicas, useGuardarBioquimica, usePaciente } from '../../hooks/useEvaluacion'
import type { NivelSemaforo } from '../../lib/semaforo'

const hoyIso = () => new Date().toISOString().slice(0, 10)

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function IconoAlerta() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" className="flex-shrink-0" aria-hidden>
      <path d="M6 .8L11.5 10.5a.6.6 0 01-.5.9H1a.6.6 0 01-.5-.9L6 .8zm0 3.4a.6.6 0 00-.6.65l.2 2.4a.4.4 0 00.8 0l.2-2.4A.6.6 0 006 4.2zm0 4.3a.7.7 0 100 1.4.7.7 0 000-1.4z" />
    </svg>
  )
}

export default function BioquimicaPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const { data: paciente } = usePaciente(pacienteId)
  const { data: historial = [] } = useBioquimicas(pacienteId)
  const guardar = useGuardarBioquimica(pacienteId)

  const sexo = paciente?.sexo ?? 'M'

  const [fecha, setFecha] = useState(hoyIso())
  const [valores, setValores] = useState<Record<string, number | ''>>({})
  const [observaciones, setObservaciones] = useState('')
  const [parametroGrafico, setParametroGrafico] = useState('hemoglobina')

  const valorDe = (id: string): number | null => {
    const v = valores[id]
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  }

  const niveles = useMemo(() => {
    const mapa: Record<string, NivelSemaforo> = {}
    for (const p of PARAMETROS_BIOQUIMICOS) mapa[p.id] = interpretarValor(p, valorDe(p.id), sexo)
    return mapa
    // `valores` es la fuente real de cambio; `valorDe` la lee.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valores, sexo])

  const criticos = PARAMETROS_BIOQUIMICOS.filter(p => niveles[p.id] === 'critico')
  const registrados = PARAMETROS_BIOQUIMICOS.filter(p => valorDe(p.id) !== null)

  /* ── Serie histórica del parámetro seleccionado ── */
  const parametroSel = parametroPorId(parametroGrafico)
  const serie = useMemo(() => {
    if (!parametroSel) return []
    return [...historial]
      .reverse()
      .map(b => {
        const encontrado = b.valores.find(v => v.parametroId === parametroGrafico)
        return encontrado?.valor != null
          ? { etiqueta: formatoFecha(b.fecha), valor: encontrado.valor }
          : null
      })
      .filter((x): x is { etiqueta: string; valor: number } => x !== null)
  }, [historial, parametroGrafico, parametroSel])

  const rangoSel = parametroSel?.rangos(sexo).optimo

  const onGuardar = async () => {
    if (!pacienteId || registrados.length === 0) return
    await guardar.mutateAsync({
      pacienteId,
      fecha,
      valores: registrados.map(p => ({ parametroId: p.id, valor: valorDe(p.id) })),
      observaciones,
    })
    setValores({})
    setObservaciones('')
  }

  const filaParametro = (p: ParametroBioquimico) => {
    const nivel = niveles[p.id]
    const critico = nivel === 'critico'
    return (
      <tr key={p.id} className="border-b border-slate-50 last:border-0">
        <td className="min-w-0 max-w-[15rem] px-3 py-2.5">
          <span className="block truncate text-[13px] font-medium text-slate-800">{p.nombre}</span>
          {p.nota && <span className="block truncate text-xs text-slate-500">{p.nota}</span>}
        </td>
        <td className="min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={valores[p.id] ?? ''}
              aria-label={`${p.nombre} en ${p.unidad}`}
              aria-invalid={critico}
              onChange={e =>
                setValores(prev => ({
                  ...prev,
                  [p.id]: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
              className={[
                'h-9 w-28 rounded-lg border bg-white px-2 text-[13px] tabular-nums focus:outline-none focus:ring-2',
                critico
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-border focus:border-primary-500 focus:ring-primary-500/20',
              ].join(' ')}
            />
            {critico && <span className="text-red-500"><IconoAlerta /></span>}
          </div>
        </td>
        <td className="min-w-0 px-3 py-2.5 text-xs text-slate-500">{textoRango(p, sexo)}</td>
        <td className="min-w-0 px-3 py-2.5">
          <SemaforoBadge size="sm" nivel={nivel}>{etiquetaNivel(nivel)}</SemaforoBadge>
        </td>
      </tr>
    )
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/evaluacion/${pacienteId}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            ← Volver a evaluaciones
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Bioquímica nutricional
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente
              ? `${paciente.nombre} ${paciente.apellido} · rangos de referencia para sexo ${sexo === 'M' ? 'masculino' : 'femenino'}`
              : 'Cargando paciente…'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-col">
            <label htmlFor="fecha" className="text-xs text-slate-500">Fecha del análisis</label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="mt-1 h-10 rounded-xl border border-border bg-white px-3 text-[13px] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </header>

      {/* Alertas críticas */}
      {criticos.length > 0 && (
        <section className="w-full min-w-0 rounded-2xl border-2 border-red-500 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-red-600"><IconoAlerta /></span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-red-700">
                {criticos.length} valor(es) fuera de rango
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {criticos.map(p => (
                  <li key={p.id}>
                    <SemaforoBadge size="sm" nivel="critico">
                      {p.nombre}: {valorDe(p.id)} {p.unidad}
                    </SemaforoBadge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Tabla por grupos */}
      <Accordion>
        {GRUPOS_BIOQUIMICA.map((grupo, i) => {
          const delGrupo = PARAMETROS_BIOQUIMICOS.filter(p => p.grupo === grupo)
          const conValor = delGrupo.filter(p => valorDe(p.id) !== null).length
          return (
            <AccordionItem
              key={grupo}
              title={grupo}
              subtitle={`${delGrupo.length} parámetros`}
              defaultOpen={i === 0}
              right={<span className="text-xs text-slate-500">{conValor} registrados</span>}
            >
              <div className="w-full min-w-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Parámetro', 'Valor', 'Referencia', 'Interpretación'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{delGrupo.map(filaParametro)}</tbody>
                </table>
              </div>
            </AccordionItem>
          )
        })}

        <AccordionItem title="Observaciones" subtitle="Notas del laboratorio o del profesional">
          <textarea
            rows={4}
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Laboratorio de origen, condiciones del ayuno, medicación en curso…"
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </AccordionItem>
      </Accordion>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {registrados.length === 0 && (
          <p className="text-xs text-slate-500">Ingresa al menos un valor para guardar.</p>
        )}
        {guardar.isSuccess && !guardar.isPending && <p className="text-xs text-primary-600">Análisis guardado.</p>}
        <button
          type="button"
          onClick={onGuardar}
          disabled={registrados.length === 0 || guardar.isPending}
          className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
        >
          {guardar.isPending ? 'Guardando…' : 'Guardar análisis'}
        </button>
      </div>

      {/* Comparativo histórico */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800">Historial comparativo</h2>
            <p className="text-xs text-slate-500">
              {historial.length} análisis registrado(s) · banda verde = rango de referencia
            </p>
          </div>
          <div className="flex min-w-0 flex-col">
            <label htmlFor="param" className="text-xs text-slate-500">Parámetro</label>
            <select
              id="param"
              value={parametroGrafico}
              onChange={e => setParametroGrafico(e.target.value)}
              className="mt-1 h-10 rounded-xl border border-border bg-white px-3 text-[13px] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {PARAMETROS_BIOQUIMICOS.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {serie.length === 0 ? (
            <div className="flex h-[200px] w-full items-center justify-center rounded-xl bg-canvas md:h-[300px]">
              <p className="max-w-xs px-6 text-center text-xs text-slate-500">
                Aún no hay valores históricos de {parametroSel?.nombre ?? 'este parámetro'}.
              </p>
            </div>
          ) : (
            <div className="h-[200px] w-full min-w-0 md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serie} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke="#E4EAE6" strokeDasharray="3 3" />
                  {rangoSel && (
                    <ReferenceArea
                      y1={rangoSel[0] ?? undefined}
                      y2={rangoSel[1] ?? undefined}
                      fill="#D2F4E4"
                      fillOpacity={0.6}
                      ifOverflow="hidden"
                    />
                  )}
                  <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: '#4F7361' }} stroke="#C9D5CC" />
                  <YAxis tick={{ fontSize: 11, fill: '#4F7361' }} stroke="#C9D5CC" width={48} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E4EAE6', fontSize: 12 }}
                    formatter={valor => [`${Number(valor)} ${parametroSel?.unidad ?? ''}`, parametroSel?.nombre ?? '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#0D9F63"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0D9F63', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
