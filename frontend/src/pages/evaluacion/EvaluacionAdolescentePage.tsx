import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accordion, AccordionItem } from '../../components/ui/Accordion'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { GraficaCrecimientoOMS } from '../../components/evaluacion/GraficaCrecimientoOMS'
import { AvisoReferencia } from './EvaluacionNinoPage'
import { calcularImc, edadEnMeses } from '../../lib/antropometria'
import { diagnosticarPercentilImc, zAPercentil, zScore } from '../../lib/oms'
import { requerimientoAdolescente } from '../../lib/requerimientos'
import { esquemaAdolescente, type FormAdolescente } from '../../schemas/evaluacion.schema'
import {
  useEvaluacionesAdolescente,
  useGuardarEvaluacionAdolescente,
  usePaciente,
} from '../../hooks/useEvaluacion'
import type { EstadioTanner } from '../../types/evaluacion'

const hoyIso = () => new Date().toISOString().slice(0, 10)

const claseInput =
  'mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] tabular-nums text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'

const ESTADIOS: { valor: EstadioTanner; titulo: string; detalle: string }[] = [
  { valor: 'I',   titulo: 'Tanner I',   detalle: 'Prepuberal' },
  { valor: 'II',  titulo: 'Tanner II',  detalle: 'Inicio puberal' },
  { valor: 'III', titulo: 'Tanner III', detalle: 'Estirón puberal' },
  { valor: 'IV',  titulo: 'Tanner IV',  detalle: 'Puberal avanzado' },
  { valor: 'V',   titulo: 'Tanner V',   detalle: 'Madurez completa' },
]

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EvaluacionAdolescentePage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const { data: paciente } = usePaciente(pacienteId)
  const { data: historial = [] } = useEvaluacionesAdolescente(pacienteId)
  const guardar = useGuardarEvaluacionAdolescente(pacienteId)

  const sexo = paciente?.sexo ?? 'M'
  const meses = paciente ? edadEnMeses(paciente.fechaNacimiento) : 0
  const anios = Math.floor(meses / 12)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormAdolescente>({
    resolver: zodResolver(esquemaAdolescente) as unknown as Resolver<FormAdolescente>,
    defaultValues: { fecha: hoyIso(), tanner: 'III', prescripcion: '' },
  })

  const valores = useWatch({ control })
  const peso = typeof valores.peso === 'number' && valores.peso > 0 ? valores.peso : null
  const talla = typeof valores.talla === 'number' && valores.talla > 0 ? valores.talla : null
  const tanner = (valores.tanner ?? 'III') as EstadioTanner

  const imc = calcularImc(peso, talla)

  const zImc = useMemo(() => (imc !== null ? zScore('imcEdad', sexo, meses, imc) : null), [imc, sexo, meses])
  const percentil = zImc !== null ? zAPercentil(zImc) : null
  const diagnostico = diagnosticarPercentilImc(percentil)

  const req = peso !== null ? requerimientoAdolescente(peso, tanner) : null

  const onSubmit = handleSubmit(async v => {
    if (!pacienteId || imc === null || !req) return
    await guardar.mutateAsync({
      pacienteId,
      fecha: v.fecha,
      edadMeses: meses,
      sexo,
      peso: v.peso as number,
      talla: v.talla as number,
      tanner: v.tanner,
      imc,
      percentilImc: percentil,
      zImcEdad: zImc,
      diagnostico: diagnostico.texto,
      requerimientoKcal: req.kcal,
      requerimientoProteinaG: req.proteinaG,
      prescripcion: v.prescripcion,
    })
    reset({ fecha: hoyIso(), tanner: 'III', prescripcion: '' })
  })

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/evaluacion/${pacienteId}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            ← Volver a evaluaciones
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Evaluación de adolescente
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente
              ? `${paciente.nombre} ${paciente.apellido} · ${anios} años · ${sexo === 'M' ? 'Masculino' : 'Femenino'}`
              : 'Cargando paciente…'}
          </p>
        </div>
        <SemaforoBadge nivel={diagnostico.nivel}>{diagnostico.texto}</SemaforoBadge>
      </header>

      <AvisoReferencia />

      <form onSubmit={onSubmit} className="flex w-full min-w-0 flex-col gap-6">
        {/* Resultados */}
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Resultados</h2>
          <p className="text-xs text-slate-500">Percentil de IMC para la edad y requerimientos por etapa puberal</p>

          <div className="mt-5 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { t: 'IMC', v: imc?.toString() ?? '—', u: 'kg/m²' },
              { t: 'Percentil IMC/E', v: percentil !== null ? `P${Math.round(percentil)}` : '—', u: '' },
              { t: 'Requerimiento', v: req ? String(req.kcal) : '—', u: 'kcal' },
              { t: 'Proteínas', v: req ? String(req.proteinaG) : '—', u: 'g' },
            ].map(m => (
              <div key={m.t} className="min-w-0">
                <p className="text-xs text-slate-500">{m.t}</p>
                <p className={`text-4xl font-extrabold tabular-nums ${m.v === '—' ? 'text-slate-400' : 'text-slate-900'}`}>
                  {m.v}
                  {m.u && m.v !== '—' && <span className="ml-1 text-base font-bold text-slate-500">{m.u}</span>}
                </p>
              </div>
            ))}
          </div>

          {req && (
            <p className="mt-4 text-xs text-slate-500">
              Etapa <strong>{req.etapa}</strong> · {req.kcalPorKg} kcal/kg y {req.proteinaPorKg} g de proteína/kg de peso
              {zImc !== null && ` · Z de IMC/E ${zImc > 0 ? `+${zImc}` : zImc}`}
            </p>
          )}
        </section>

        <Accordion>
          <AccordionItem title="Mediciones" subtitle="Peso y talla de la consulta" defaultOpen>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex min-w-0 flex-col">
                <label htmlFor="fecha" className="text-xs text-slate-500">Fecha</label>
                <input id="fecha" type="date" {...register('fecha')} className={claseInput} />
                {errors.fecha && <p className="mt-1 text-xs text-red-500">{errors.fecha.message}</p>}
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor="peso" className="text-xs text-slate-500">Peso <span className="text-text-disabled">(kg)</span></label>
                <input id="peso" type="number" step="0.1" min="0" {...register('peso', { valueAsNumber: true })} className={claseInput} />
                {errors.peso && <p className="mt-1 text-xs text-red-500">{errors.peso.message}</p>}
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor="talla" className="text-xs text-slate-500">Talla <span className="text-text-disabled">(cm)</span></label>
                <input id="talla" type="number" step="0.1" min="0" {...register('talla', { valueAsNumber: true })} className={claseInput} />
                {errors.talla && <p className="mt-1 text-xs text-red-500">{errors.talla.message}</p>}
              </div>
            </div>
          </AccordionItem>

          <AccordionItem title="Estadio de Tanner" subtitle="Determina el requerimiento por etapa puberal" defaultOpen>
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ESTADIOS.map(e => {
                const activo = tanner === e.valor
                return (
                  <button
                    key={e.valor}
                    type="button"
                    onClick={() => setValue('tanner', e.valor, { shouldValidate: true })}
                    aria-pressed={activo}
                    className={[
                      'flex min-w-0 flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors',
                      activo
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-border bg-white hover:border-primary-200 hover:bg-canvas',
                    ].join(' ')}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-white">
                      {e.valor}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-800">{e.titulo}</span>
                    <span className="text-xs text-slate-500">{e.detalle}</span>
                  </button>
                )
              })}
            </div>
            {errors.tanner && <p className="mt-1 text-xs text-red-500">{errors.tanner.message}</p>}
          </AccordionItem>

          <AccordionItem title="Prescripción nutricional" subtitle="Pautas ajustadas al estirón puberal">
            <textarea
              rows={6}
              {...register('prescripcion')}
              placeholder="Distribución de comidas, calcio y hierro, actividad física, imagen corporal…"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </AccordionItem>
        </Accordion>

        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">IMC para la edad</h2>
          <p className="text-xs text-slate-500">Percentiles P3, P15, P50, P85 y P97</p>
          <div className="mt-4">
            <GraficaCrecimientoOMS
              indicador="imcEdad"
              sexo={sexo}
              x={meses}
              valor={imc}
              rangoX={[120, 216]}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
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
                  {['Fecha', 'Tanner', 'IMC', 'Percentil', 'Kcal', 'Diagnóstico'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0">
                    <td className="min-w-0 px-3 py-2.5 text-slate-800">{formatoFecha(h.fecha)}</td>
                    <td className="min-w-0 px-3 py-2.5 text-slate-500">{h.tanner}</td>
                    <td className="min-w-0 px-3 py-2.5 font-semibold tabular-nums text-slate-800">{h.imc}</td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">
                      {h.percentilImc !== null ? `P${Math.round(h.percentilImc)}` : '—'}
                    </td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">{h.requerimientoKcal}</td>
                    <td className="min-w-0 px-3 py-2.5">
                      <SemaforoBadge size="sm" nivel={diagnosticarPercentilImc(h.percentilImc).nivel}>
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
