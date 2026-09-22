import { Link, useParams } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accordion, AccordionItem } from '../../components/ui/Accordion'
import { Slider } from '../../components/ui/Slider'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { nivelPorRango } from '../../lib/semaforo'
import { calcularImc } from '../../lib/antropometria'
import {
  adicionalPorTrimestre,
  alturaUterinaEsperada,
  gananciaEsperada,
  rangoIom,
  trimestreDeSemana,
} from '../../lib/requerimientos'
import { esquemaEmbarazada, type FormEmbarazada } from '../../schemas/evaluacion.schema'
import {
  useEvaluacionesEmbarazada,
  useGuardarEvaluacionEmbarazada,
  usePaciente,
} from '../../hooks/useEvaluacion'

const hoyIso = () => new Date().toISOString().slice(0, 10)

const claseInput =
  'mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] tabular-nums text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EvaluacionEmbarazadaPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const { data: paciente } = usePaciente(pacienteId)
  const { data: historial = [] } = useEvaluacionesEmbarazada(pacienteId)
  const guardar = useGuardarEvaluacionEmbarazada(pacienteId)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormEmbarazada>({
    resolver: zodResolver(esquemaEmbarazada) as unknown as Resolver<FormEmbarazada>,
    defaultValues: { fecha: hoyIso(), semanasGestacion: 20, prescripcion: '' },
  })

  const v = useWatch({ control })
  const numero = (x: unknown) => (typeof x === 'number' && x > 0 ? x : null)

  const pesoPre = numero(v.pesoPregestacional)
  const talla = numero(v.talla)
  const pesoActual = numero(v.pesoActual)
  const semanas = typeof v.semanasGestacion === 'number' ? v.semanasGestacion : 20
  const alturaMedida = numero(v.alturaUterinaMedida)

  const trimestre = trimestreDeSemana(semanas)
  const imcPre = calcularImc(pesoPre, talla)
  const rango = imcPre !== null ? rangoIom(imcPre) : null
  const esperada = imcPre !== null ? gananciaEsperada(imcPre, semanas) : null
  const ganancia = pesoPre !== null && pesoActual !== null ? Math.round((pesoActual - pesoPre) * 10) / 10 : null

  // Semáforo de la ganancia: dentro del rango IOM = verde, ±1 kg = ámbar.
  const nivelGanancia =
    ganancia === null || esperada === null
      ? 'neutro'
      : nivelPorRango(ganancia, [esperada.min, esperada.max], [esperada.min - 1, esperada.max + 1])

  const auEsperada = alturaUterinaEsperada(semanas)
  const nivelAltura =
    auEsperada === null || alturaMedida === null
      ? 'neutro'
      : nivelPorRango(alturaMedida, [auEsperada - 2, auEsperada + 2], [auEsperada - 3, auEsperada + 3])

  // Barra: posición de la ganancia actual dentro del rango recomendado.
  const anchoBarra =
    ganancia !== null && esperada !== null && esperada.max > 0
      ? Math.max(0, Math.min(100, (ganancia / (esperada.max * 1.3)) * 100))
      : 0
  const zonaMin = esperada !== null ? (esperada.min / (esperada.max * 1.3)) * 100 : 0
  const zonaMax = esperada !== null ? (esperada.max / (esperada.max * 1.3)) * 100 : 0

  const onSubmit = handleSubmit(async valores => {
    if (!pacienteId || imcPre === null || !rango || !esperada || ganancia === null) return
    await guardar.mutateAsync({
      pacienteId,
      fecha: valores.fecha,
      pesoPregestacional: valores.pesoPregestacional as number,
      talla: valores.talla as number,
      pesoActual: valores.pesoActual as number,
      semanasGestacion: valores.semanasGestacion,
      trimestre,
      imcPregestacional: imcPre,
      categoriaImc: rango.categoria,
      gananciaActual: ganancia,
      gananciaMin: esperada.min,
      gananciaMax: esperada.max,
      alturaUterinaMedida: valores.alturaUterinaMedida as number | undefined,
      alturaUterinaEsperada: auEsperada,
      prescripcion: valores.prescripcion,
    })
    reset({ fecha: hoyIso(), semanasGestacion: 20, prescripcion: '' })
  })

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/evaluacion/${pacienteId}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            ← Volver a evaluaciones
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Evaluación de embarazada
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Cargando paciente…'} · Semana {semanas} ·{' '}
            {trimestre}.º trimestre
          </p>
        </div>
        <SemaforoBadge nivel={nivelGanancia}>
          {ganancia === null ? 'Sin datos de ganancia' : `${ganancia > 0 ? '+' : ''}${ganancia} kg`}
        </SemaforoBadge>
      </header>

      <form onSubmit={onSubmit} className="flex w-full min-w-0 flex-col gap-6">
        {/* Resultados */}
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Control de ganancia de peso</h2>
          <p className="text-xs text-slate-500">Recomendación IOM 2009 según IMC pregestacional</p>

          <div className="mt-5 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { t: 'IMC pregestacional', v: imcPre?.toString() ?? '—', u: 'kg/m²' },
              { t: 'Ganancia actual', v: ganancia !== null ? String(ganancia) : '—', u: 'kg' },
              { t: 'Rango recomendado', v: esperada ? `${esperada.min}–${esperada.max}` : '—', u: 'kg' },
              { t: 'Adicional energético', v: String(adicionalPorTrimestre(trimestre)), u: 'kcal' },
            ].map(m => (
              <div key={m.t} className="min-w-0">
                <p className="text-xs text-slate-500">{m.t}</p>
                <p className={`text-4xl font-extrabold tabular-nums ${m.v === '—' ? 'text-slate-400' : 'text-slate-900'}`}>
                  {m.v}
                  {m.v !== '—' && <span className="ml-1 text-base font-bold text-slate-500">{m.u}</span>}
                </p>
              </div>
            ))}
          </div>

          {rango && (
            <p className="mt-3 text-xs text-slate-500">
              Categoría <strong>{rango.categoria}</strong> · ganancia total esperada para todo el embarazo{' '}
              {rango.totalMin}–{rango.totalMax} kg · ritmo {rango.semanalMin}–{rango.semanalMax} kg/semana
            </p>
          )}

          {/* Barra de progreso con zona recomendada */}
          {esperada && (
            <div className="mt-5">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="absolute inset-y-0 bg-primary-100"
                  style={{ left: `${zonaMin}%`, width: `${Math.max(0, zonaMax - zonaMin)}%` }}
                  aria-hidden
                />
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    nivelGanancia === 'optimo' ? 'bg-primary-500'
                    : nivelGanancia === 'precaucion' ? 'bg-accent-500'
                    : nivelGanancia === 'critico' ? 'bg-red-500'
                    : 'bg-slate-300'
                  }`}
                  style={{ width: `${anchoBarra}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">0 kg</span>
                <span className="text-[11px] text-slate-500">
                  Zona recomendada {esperada.min}–{esperada.max} kg a la semana {semanas}
                </span>
              </div>
            </div>
          )}
        </section>

        <Accordion>
          <AccordionItem title="Datos gestacionales" subtitle="Peso previo, talla y semanas de gestación" defaultOpen>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex min-w-0 flex-col">
                <label htmlFor="fecha" className="text-xs text-slate-500">Fecha</label>
                <input id="fecha" type="date" {...register('fecha')} className={claseInput} />
                {errors.fecha && <p className="mt-1 text-xs text-red-500">{errors.fecha.message}</p>}
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor="pesoPre" className="text-xs text-slate-500">Peso pregestacional <span className="text-text-disabled">(kg)</span></label>
                <input id="pesoPre" type="number" step="0.1" min="0" {...register('pesoPregestacional', { valueAsNumber: true })} className={claseInput} />
                {errors.pesoPregestacional && <p className="mt-1 text-xs text-red-500">{errors.pesoPregestacional.message}</p>}
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor="talla" className="text-xs text-slate-500">Talla <span className="text-text-disabled">(cm)</span></label>
                <input id="talla" type="number" step="0.1" min="0" {...register('talla', { valueAsNumber: true })} className={claseInput} />
                {errors.talla && <p className="mt-1 text-xs text-red-500">{errors.talla.message}</p>}
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor="pesoActual" className="text-xs text-slate-500">Peso actual <span className="text-text-disabled">(kg)</span></label>
                <input id="pesoActual" type="number" step="0.1" min="0" {...register('pesoActual', { valueAsNumber: true })} className={claseInput} />
                {errors.pesoActual && <p className="mt-1 text-xs text-red-500">{errors.pesoActual.message}</p>}
              </div>
            </div>

            <div className="mt-5">
              <Slider
                label="Semanas de gestación"
                min={1}
                max={42}
                step={1}
                value={semanas}
                onChange={n => setValue('semanasGestacion', n, { shouldValidate: true })}
                valueLabel={`Semana ${semanas} · ${trimestre}.º trimestre`}
                marks={[
                  { value: 1, label: '1' },
                  { value: 14, label: '14' },
                  { value: 28, label: '28' },
                  { value: 42, label: '42' },
                ]}
              />
            </div>
          </AccordionItem>

          <AccordionItem title="Altura uterina" subtitle="Regla de McDonald: válida entre las semanas 20 y 34">
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex min-w-0 flex-col">
                <label htmlFor="au" className="text-xs text-slate-500">Altura uterina medida <span className="text-text-disabled">(cm)</span></label>
                <input id="au" type="number" step="0.5" min="0" {...register('alturaUterinaMedida', { valueAsNumber: true })} className={claseInput} />
                {errors.alturaUterinaMedida && <p className="mt-1 text-xs text-red-500">{errors.alturaUterinaMedida.message}</p>}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Esperada a la semana {semanas}</p>
                <p className={`text-4xl font-extrabold tabular-nums ${auEsperada === null ? 'text-slate-400' : 'text-slate-900'}`}>
                  {auEsperada ?? '—'}
                  {auEsperada !== null && <span className="ml-1 text-base font-bold text-slate-500">cm</span>}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Interpretación</p>
                <div className="mt-2">
                  <SemaforoBadge nivel={nivelAltura}>
                    {auEsperada === null
                      ? 'Fuera de la ventana 20–34'
                      : alturaMedida === null
                        ? 'Sin medición'
                        : nivelAltura === 'optimo'
                          ? 'Acorde a la edad gestacional'
                          : nivelAltura === 'precaucion'
                            ? 'Levemente desviada'
                            : 'Discordante — evaluar'}
                  </SemaforoBadge>
                </div>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem title={`Prescripción del ${trimestre}.º trimestre`} subtitle="Indicaciones específicas de la etapa">
            <p className="mb-3 text-xs text-slate-500">
              Adicional energético recomendado para este trimestre:{' '}
              <strong>{adicionalPorTrimestre(trimestre)} kcal/día</strong> sobre el requerimiento previo al embarazo.
            </p>
            <textarea
              rows={6}
              {...register('prescripcion')}
              placeholder="Suplementación de hierro y ácido fólico, manejo de náuseas o reflujo, fraccionamiento, actividad física…"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </AccordionItem>
        </Accordion>

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
        <h2 className="text-base font-bold text-slate-800">Controles previos</h2>
        {historial.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8">
            <p className="text-lg font-bold text-slate-800">Sin controles registrados</p>
            <p className="text-xs text-slate-500">El primero que guardes aparecerá acá.</p>
          </div>
        ) : (
          <div className="mt-4 w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Fecha', 'Semana', 'IMC pre', 'Categoría', 'Ganancia', 'Rango'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0">
                    <td className="min-w-0 px-3 py-2.5 text-slate-800">{formatoFecha(h.fecha)}</td>
                    <td className="min-w-0 px-3 py-2.5 text-slate-500">{h.semanasGestacion}</td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">{h.imcPregestacional}</td>
                    <td className="min-w-0 px-3 py-2.5 text-slate-500">{h.categoriaImc}</td>
                    <td className="min-w-0 px-3 py-2.5">
                      <SemaforoBadge
                        size="sm"
                        nivel={nivelPorRango(h.gananciaActual, [h.gananciaMin, h.gananciaMax], [h.gananciaMin - 1, h.gananciaMax + 1])}
                      >
                        {h.gananciaActual > 0 ? '+' : ''}{h.gananciaActual} kg
                      </SemaforoBadge>
                    </td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">
                      {h.gananciaMin}–{h.gananciaMax} kg
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
