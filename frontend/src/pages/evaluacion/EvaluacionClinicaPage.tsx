import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Accordion, AccordionItem } from '../../components/ui/Accordion'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { deficienciasSugeridas, SISTEMAS_CLINICOS } from '../../lib/clinica'
import { interpretarValor, parametroPorId } from '../../lib/bioquimica'
import {
  useBioquimicas,
  useEvaluacionesClinicas,
  useGuardarEvaluacionClinica,
  usePaciente,
} from '../../hooks/useEvaluacion'
import type { SignoMarcado } from '../../types/evaluacion'

const hoyIso = () => new Date().toISOString().slice(0, 10)

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EvaluacionClinicaPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const { data: paciente } = usePaciente(pacienteId)
  const { data: historial = [] } = useEvaluacionesClinicas(pacienteId)
  const { data: bioquimicas = [] } = useBioquimicas(pacienteId)
  const guardar = useGuardarEvaluacionClinica(pacienteId)

  const sexo = paciente?.sexo ?? 'M'

  const [fecha, setFecha] = useState(hoyIso())
  const [marcados, setMarcados] = useState<Record<string, boolean>>({})
  const [observaciones, setObservaciones] = useState<Record<string, string>>({})
  const [notaGeneral, setNotaGeneral] = useState('')

  const presentes = useMemo(
    () => Object.entries(marcados).filter(([, v]) => v).map(([id]) => id),
    [marcados]
  )

  const deficiencias = useMemo(() => deficienciasSugeridas(presentes), [presentes])

  /* ── Cruce con la última bioquímica ── */
  const ultimaBioquimica = bioquimicas[0]

  const estadoLaboratorio = useMemo(() => {
    const mapa: Record<string, { nombre: string; valor: number; nivel: ReturnType<typeof interpretarValor> }> = {}
    if (!ultimaBioquimica) return mapa

    for (const v of ultimaBioquimica.valores) {
      const p = parametroPorId(v.parametroId)
      if (!p || v.valor === null) continue
      mapa[p.id] = { nombre: p.nombre, valor: v.valor, nivel: interpretarValor(p, v.valor, sexo) }
    }
    return mapa
  }, [ultimaBioquimica, sexo])

  const onGuardar = async () => {
    if (!pacienteId) return
    const signos: SignoMarcado[] = Object.keys(marcados)
      .filter(id => marcados[id])
      .map(id => ({ signoId: id, presente: true, observacion: observaciones[id] }))

    await guardar.mutateAsync({
      pacienteId,
      fecha,
      signos,
      deficienciasDetectadas: deficiencias.map(d => d.nutriente),
      observaciones: notaGeneral,
    })
    setMarcados({})
    setObservaciones({})
    setNotaGeneral('')
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/evaluacion/${pacienteId}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            ← Volver a evaluaciones
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Evaluación clínica
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Cargando paciente…'} · {presentes.length} signo(s)
            marcado(s)
          </p>
        </div>

        <div className="flex min-w-0 flex-col">
          <label htmlFor="fecha" className="text-xs text-slate-500">Fecha del examen</label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="mt-1 h-10 rounded-xl border border-border bg-white px-3 text-[13px] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </header>

      {/* Deficiencias sugeridas */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Deficiencias sugeridas</h2>
        <p className="text-xs text-slate-500">
          Ordenadas por número de signos que las respaldan; el laboratorio confirma o descarta
        </p>

        {deficiencias.length === 0 ? (
          <p className="mt-4 text-xs text-slate-500">
            Marca los signos presentes y aparecerán acá los nutrientes a investigar.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {deficiencias.map(d => (
              <li key={d.nutriente} className="min-w-0 rounded-xl border border-border bg-canvas p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-slate-800">{d.nutriente}</span>
                  <SemaforoBadge size="sm" nivel={d.signos.length > 1 ? 'critico' : 'precaucion'}>
                    {d.signos.length} signo(s)
                  </SemaforoBadge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{d.signos.join(' · ')}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Checklist por sistemas */}
      <Accordion>
        {SISTEMAS_CLINICOS.map((sistema, i) => {
          const marcadosDelSistema = sistema.signos.filter(s => marcados[s.id]).length
          return (
            <AccordionItem
              key={sistema.id}
              title={sistema.titulo}
              subtitle={sistema.descripcion}
              defaultOpen={i === 0}
              right={
                marcadosDelSistema > 0 ? (
                  <SemaforoBadge size="sm" nivel="precaucion">{marcadosDelSistema} marcado(s)</SemaforoBadge>
                ) : (
                  <span className="text-xs text-slate-500">{sistema.signos.length} signos</span>
                )
              }
            >
              <div className="flex flex-col gap-3">
                {sistema.signos.map(signo => {
                  const activo = Boolean(marcados[signo.id])
                  // Parámetros de laboratorio alterados que respaldan el signo.
                  const respaldo = (signo.parametrosRelacionados ?? [])
                    .map(id => estadoLaboratorio[id])
                    .filter(x => x && x.nivel !== 'optimo' && x.nivel !== 'neutro')

                  return (
                    <div
                      key={signo.id}
                      className={[
                        'min-w-0 rounded-xl border p-4 transition-colors',
                        activo ? 'border-primary-300 bg-primary-50' : 'border-border bg-white',
                      ].join(' ')}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={e => setMarcados(prev => ({ ...prev, [signo.id]: e.target.checked }))}
                          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-primary-500"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-slate-800">{signo.nombre}</span>
                          <span className="block text-xs text-slate-500">{signo.descripcion}</span>
                          <span className="mt-1 block text-xs text-slate-500">
                            Asociado a: {signo.deficiencias.join(', ')}
                          </span>
                        </span>
                      </label>

                      {/* Vínculo con bioquímica */}
                      {respaldo.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          <span className="text-xs text-slate-500">Laboratorio relacionado:</span>
                          {respaldo.map(r => (
                            <SemaforoBadge key={r.nombre} size="sm" nivel={r.nivel}>
                              {r.nombre}: {r.valor}
                            </SemaforoBadge>
                          ))}
                        </div>
                      )}

                      {/* Observación expandible */}
                      {activo && (
                        <div className="mt-3 flex min-w-0 flex-col">
                          <label htmlFor={`obs-${signo.id}`} className="text-xs text-slate-500">
                            Observación
                          </label>
                          <input
                            id={`obs-${signo.id}`}
                            value={observaciones[signo.id] ?? ''}
                            onChange={e =>
                              setObservaciones(prev => ({ ...prev, [signo.id]: e.target.value }))
                            }
                            placeholder="Localización, intensidad, tiempo de evolución…"
                            className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </AccordionItem>
          )
        })}

        <AccordionItem title="Nota general" subtitle="Impresión clínica global">
          <textarea
            rows={4}
            value={notaGeneral}
            onChange={e => setNotaGeneral(e.target.value)}
            placeholder="Impresión global, antecedentes relevantes, derivaciones sugeridas…"
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </AccordionItem>
      </Accordion>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {guardar.isSuccess && !guardar.isPending && <p className="text-xs text-primary-600">Evaluación guardada.</p>}
        <button
          type="button"
          onClick={onGuardar}
          disabled={guardar.isPending}
          className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
        >
          {guardar.isPending ? 'Guardando…' : 'Guardar evaluación'}
        </button>
      </div>

      {/* Historial */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Exámenes previos</h2>
        {historial.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8">
            <p className="text-lg font-bold text-slate-800">Sin exámenes registrados</p>
            <p className="text-xs text-slate-500">El primero que guardes aparecerá acá.</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {historial.map(h => (
              <li key={h.id} className="min-w-0 rounded-xl border border-border bg-canvas p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-slate-800">{formatoFecha(h.fecha)}</span>
                  <span className="text-xs text-slate-500">
                    {h.signos.filter(s => s.presente).length} signo(s) presente(s)
                  </span>
                </div>
                {h.deficienciasDetectadas.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {h.deficienciasDetectadas.map(d => (
                      <li key={d}>
                        <SemaforoBadge size="sm" nivel="precaucion">{d}</SemaforoBadge>
                      </li>
                    ))}
                  </ul>
                )}
                {h.observaciones && <p className="mt-2 text-xs text-slate-500">{h.observaciones}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
