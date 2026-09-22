import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accordion, AccordionItem } from '../../components/ui/Accordion'
import { Tabs } from '../../components/ui/Tabs'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { GraficaCrecimientoOMS } from '../../components/evaluacion/GraficaCrecimientoOMS'
import { calcularImc, edadEnMeses } from '../../lib/antropometria'
import {
  diagnosticarZ,
  ETIQUETA_INDICADOR,
  REFERENCIA_ABREVIADA,
  zScore,
  type IndicadorOms,
} from '../../lib/oms'
import { esquemaNino, type FormNino } from '../../schemas/evaluacion.schema'
import {
  useEvaluacionesNino,
  useGuardarEvaluacionNino,
  usePaciente,
} from '../../hooks/useEvaluacion'

const hoyIso = () => new Date().toISOString().slice(0, 10)

const claseInput =
  'mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] tabular-nums text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function AvisoReferencia() {
  if (!REFERENCIA_ABREVIADA) return null
  return (
    <div className="rounded-xl border border-amber-200 bg-accent-50 p-4">
      <p className="text-xs text-accent-600">
        <strong>Tabla de referencia abreviada.</strong> Las curvas y los Z-scores se calculan con puntos
        ancla interpolados, no con las tablas OMS mes a mes completas. Sirven para desarrollo y demostración;
        antes de usarlos en consulta hay que cargar los archivos oficiales en{' '}
        <code className="font-mono text-[11px]">src/lib/oms.ts</code>.
      </p>
    </div>
  )
}

export default function EvaluacionNinoPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const { data: paciente } = usePaciente(pacienteId)
  const { data: historial = [] } = useEvaluacionesNino(pacienteId)
  const guardar = useGuardarEvaluacionNino(pacienteId)

  const [indicadorGrafico, setIndicadorGrafico] = useState<IndicadorOms>('pesoEdad')

  const sexo = paciente?.sexo ?? 'M'
  const meses = paciente ? edadEnMeses(paciente.fechaNacimiento) : 0
  const anios = Math.floor(meses / 12)
  const menorDeDos = meses < 24

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormNino>({
    resolver: zodResolver(esquemaNino) as unknown as Resolver<FormNino>,
    defaultValues: { fecha: hoyIso(), prescripcion: '' },
  })

  const valores = useWatch({ control })
  const peso = typeof valores.peso === 'number' && valores.peso > 0 ? valores.peso : null
  const talla = typeof valores.talla === 'number' && valores.talla > 0 ? valores.talla : null
  const imc = calcularImc(peso, talla)

  const zs = useMemo(
    () => ({
      pesoEdad: peso !== null ? zScore('pesoEdad', sexo, meses, peso) : null,
      tallaEdad: talla !== null ? zScore('tallaEdad', sexo, meses, talla) : null,
      pesoTalla: peso !== null && talla !== null ? zScore('pesoTalla', sexo, talla, peso) : null,
      imcEdad: imc !== null ? zScore('imcEdad', sexo, meses, imc) : null,
    }),
    [peso, talla, imc, sexo, meses]
  )

  const diagnosticoPrincipal = diagnosticarZ('pesoTalla', zs.pesoTalla ?? zs.imcEdad)

  const valorGraficado =
    indicadorGrafico === 'pesoEdad' ? peso
    : indicadorGrafico === 'tallaEdad' ? talla
    : indicadorGrafico === 'pesoTalla' ? peso
    : imc

  const xGraficado = indicadorGrafico === 'pesoTalla' ? (talla ?? 0) : meses

  const onSubmit = handleSubmit(async v => {
    if (!pacienteId) return
    await guardar.mutateAsync({
      pacienteId,
      fecha: v.fecha,
      edadMeses: meses,
      sexo,
      peso: v.peso as number,
      talla: v.talla as number,
      perimetroCefalico: v.perimetroCefalico as number | undefined,
      zPesoEdad: zs.pesoEdad,
      zTallaEdad: zs.tallaEdad,
      zPesoTalla: zs.pesoTalla,
      zImcEdad: zs.imcEdad,
      diagnostico: diagnosticoPrincipal.texto,
      prescripcion: v.prescripcion,
    })
    reset({ fecha: hoyIso(), prescripcion: '' })
  })

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/evaluacion/${pacienteId}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            ← Volver a evaluaciones
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Evaluación de niño
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente
              ? `${paciente.nombre} ${paciente.apellido} · ${anios} a ${meses % 12} m (${meses} meses) · ${sexo === 'M' ? 'Masculino' : 'Femenino'}`
              : 'Cargando paciente…'}
          </p>
        </div>
        <SemaforoBadge nivel={diagnosticoPrincipal.nivel}>{diagnosticoPrincipal.texto}</SemaforoBadge>
      </header>

      <AvisoReferencia />

      <form onSubmit={onSubmit} className="flex w-full min-w-0 flex-col gap-6">
        {/* Z-scores en vivo */}
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Z-scores OMS</h2>
          <p className="text-xs text-slate-500">Estándares de crecimiento 2006/2007</p>

          <div className="mt-5 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            {(Object.keys(zs) as IndicadorOms[]).map(ind => {
              const z = zs[ind]
              const dx = diagnosticarZ(ind, z)
              return (
                <div key={ind} className="min-w-0">
                  <p className="text-xs text-slate-500">{ETIQUETA_INDICADOR[ind]}</p>
                  <p className={`text-4xl font-extrabold tabular-nums ${z === null ? 'text-slate-400' : 'text-slate-900'}`}>
                    {z === null ? '—' : z > 0 ? `+${z}` : z}
                  </p>
                  <div className="mt-1">
                    <SemaforoBadge size="sm" nivel={dx.nivel}>{dx.texto}</SemaforoBadge>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Accordion>
          <AccordionItem title="Mediciones" subtitle="Peso, talla y perímetro cefálico" defaultOpen>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex min-w-0 flex-col">
                <label htmlFor="fecha" className="text-xs text-slate-500">Fecha</label>
                <input id="fecha" type="date" {...register('fecha')} className={claseInput} />
                {errors.fecha && <p className="mt-1 text-xs text-red-500">{errors.fecha.message}</p>}
              </div>

              <div className="flex min-w-0 flex-col">
                <label htmlFor="peso" className="text-xs text-slate-500">Peso <span className="text-text-disabled">(kg)</span></label>
                <input id="peso" type="number" step="0.01" min="0" {...register('peso', { valueAsNumber: true })} className={claseInput} />
                {errors.peso && <p className="mt-1 text-xs text-red-500">{errors.peso.message}</p>}
              </div>

              <div className="flex min-w-0 flex-col">
                <label htmlFor="talla" className="text-xs text-slate-500">
                  {menorDeDos ? 'Longitud acostado' : 'Talla de pie'} <span className="text-text-disabled">(cm)</span>
                </label>
                <input id="talla" type="number" step="0.1" min="0" {...register('talla', { valueAsNumber: true })} className={claseInput} />
                {errors.talla && <p className="mt-1 text-xs text-red-500">{errors.talla.message}</p>}
              </div>

              {menorDeDos && (
                <div className="flex min-w-0 flex-col">
                  <label htmlFor="pc" className="text-xs text-slate-500">Perímetro cefálico <span className="text-text-disabled">(cm)</span></label>
                  <input id="pc" type="number" step="0.1" min="0" {...register('perimetroCefalico', { valueAsNumber: true })} className={claseInput} />
                  {errors.perimetroCefalico && <p className="mt-1 text-xs text-red-500">{errors.perimetroCefalico.message}</p>}
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Edad exacta calculada de la fecha de nacimiento: <strong>{meses} meses</strong>
              {menorDeDos && ' · el perímetro cefálico se solicita solo hasta los 24 meses'}
              {imc !== null && ` · IMC ${imc} kg/m²`}
            </p>
          </AccordionItem>

          <AccordionItem title="Prescripción nutricional" subtitle="Indicaciones según edad y diagnóstico">
            <textarea
              rows={6}
              {...register('prescripcion')}
              placeholder="Consistencia y frecuencia de las comidas, lactancia, suplementación, pautas para el cuidador…"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {errors.prescripcion && <p className="mt-1 text-xs text-red-500">{errors.prescripcion.message}</p>}
          </AccordionItem>
        </Accordion>

        {/* Curvas OMS */}
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800">Curvas de crecimiento OMS</h2>
              <p className="text-xs text-slate-500">Percentiles P3, P15, P50, P85 y P97</p>
            </div>
            <Tabs
              aria-label="Indicador"
              size="sm"
              items={(Object.keys(ETIQUETA_INDICADOR) as IndicadorOms[]).map(i => ({
                value: i,
                label: ETIQUETA_INDICADOR[i],
              }))}
              value={indicadorGrafico}
              onChange={v => setIndicadorGrafico(v as IndicadorOms)}
            />
          </div>
          <div className="mt-4">
            <GraficaCrecimientoOMS
              indicador={indicadorGrafico}
              sexo={sexo}
              x={xGraficado}
              valor={valorGraficado}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {guardar.isError && <p className="text-xs text-red-500">No se pudo guardar. Reintenta.</p>}
          {guardar.isSuccess && !guardar.isPending && <p className="text-xs text-primary-600">Evaluación guardada.</p>}
          <button
            type="submit"
            disabled={guardar.isPending}
            className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
          >
            {guardar.isPending ? 'Guardando…' : 'Guardar evaluación'}
          </button>
        </div>
      </form>

      {/* Historial */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Evaluaciones previas</h2>
        {historial.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8">
            <p className="text-lg font-bold text-slate-800">Sin evaluaciones registradas</p>
            <p className="text-xs text-slate-500">La primera que guardes aparecerá acá.</p>
          </div>
        ) : (
          <div className="mt-4 w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Fecha', 'Edad', 'Peso', 'Talla', 'Z P/T', 'Diagnóstico'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0">
                    <td className="min-w-0 px-3 py-2.5 text-slate-800">{formatoFecha(h.fecha)}</td>
                    <td className="min-w-0 px-3 py-2.5 text-slate-500">{h.edadMeses} m</td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">{h.peso} kg</td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">{h.talla} cm</td>
                    <td className="min-w-0 px-3 py-2.5 font-semibold tabular-nums text-slate-800">{h.zPesoTalla ?? '—'}</td>
                    <td className="min-w-0 px-3 py-2.5">
                      <SemaforoBadge size="sm" nivel={diagnosticarZ('pesoTalla', h.zPesoTalla).nivel}>
                        {h.diagnostico}
                      </SemaforoBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
