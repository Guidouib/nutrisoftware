import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../components/ui/Modal'
import { Slider } from '../../components/ui/Slider'
import { Tabs } from '../../components/ui/Tabs'
import { LineaTiempoConsultas } from '../../components/seguimiento/LineaTiempoConsultas'
import {
  GraficaAdherencia,
  GraficaImc,
  GraficaMedidas,
  GraficaPeso,
} from '../../components/seguimiento/GraficasEvolucion'
import { esquemaControl, type FormControl } from '../../schemas/evaluacion.schema'
import {
  useAdherencia,
  useControles,
  useCrearControl,
  useEvolucion,
  useGuardarMeta,
  useMeta,
  useResumenProgreso,
} from '../../hooks/useSeguimiento'
import { useAntropometrias, usePaciente } from '../../hooks/useEvaluacion'
import { ETIQUETAS_CUMPLIMIENTO, PERIODOS, type PeriodoSeguimiento } from '../../types/seguimiento'

const hoyIso = () => new Date().toISOString().slice(0, 10)

function CampoForm({
  id, label, sufijo, error, children,
}: {
  id: string
  label: string
  sufijo?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <label htmlFor={id} className="text-xs text-slate-500">
        {label} {sufijo && <span className="text-text-disabled">({sufijo})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const claseInput =
  'mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] tabular-nums text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'

export default function SeguimientoPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()

  const { data: paciente } = usePaciente(pacienteId)
  const { data: controles = [], isLoading } = useControles(pacienteId)
  const { data: meta } = useMeta(pacienteId)
  const { data: antropometrias = [] } = useAntropometrias(pacienteId)
  const crear = useCrearControl(pacienteId)
  const guardarMeta = useGuardarMeta(pacienteId)

  const [periodo, setPeriodo] = useState<PeriodoSeguimiento>('todo')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoMeta, setEditandoMeta] = useState(false)
  const [metaBorrador, setMetaBorrador] = useState<number | ''>('')

  // La talla rara vez se repite en cada control: se toma de la última ISAK.
  const tallaBase = antropometrias[0]?.medidas.talla ?? null

  const puntos = useEvolucion(controles, periodo, tallaBase)
  const resumen = useResumenProgreso(controles, meta?.pesoObjetivo ?? null)
  const adherencia = useAdherencia(puntos)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormControl>({
    resolver: zodResolver(esquemaControl) as unknown as Resolver<FormControl>,
    defaultValues: { fecha: hoyIso(), cumplimiento: 4 },
  })

  const cumplimiento = watch('cumplimiento') ?? 4

  const onSubmit = handleSubmit(async valores => {
    if (!pacienteId) return
    await crear.mutateAsync({
      pacienteId,
      fecha: valores.fecha,
      peso: valores.peso as number,
      talla: valores.talla as number | undefined,
      medidas: {
        perimetroAbdominal: valores.perimetroAbdominal as number | undefined,
        perimetroCintura: valores.perimetroCintura as number | undefined,
        perimetroCadera: valores.perimetroCadera as number | undefined,
        perimetroBrazo: valores.perimetroBrazo as number | undefined,
      },
      cumplimiento: valores.cumplimiento,
      observaciones: valores.observaciones,
    })
    reset({ fecha: hoyIso(), cumplimiento: 4 })
    setModalAbierto(false)
  })

  const confirmarMeta = async () => {
    if (!pacienteId) return
    await guardarMeta.mutateAsync({
      pacienteId,
      pesoObjetivo: metaBorrador === '' ? null : metaBorrador,
    })
    setEditandoMeta(false)
  }

  const ultimoPeso = controles[0]?.peso ?? null

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* ── Encabezado ── */}
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={pacienteId ? `/evaluacion/${pacienteId}` : '/pacientes'}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            ← Volver a evaluaciones
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Seguimiento y monitoreo
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Cargando paciente…'} ·{' '}
            {controles.length} control(es)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          Nueva consulta de control
        </button>
      </header>

      {/* ── Resumen de progreso ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800">Resumen de progreso</h2>
            <p className="text-xs text-slate-500">
              {resumen.semanasEnTratamiento} semana(s) en tratamiento
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMetaBorrador(meta?.pesoObjetivo ?? '')
              setEditandoMeta(true)
            }}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            {meta?.pesoObjetivo ? 'Cambiar meta' : 'Definir peso objetivo'}
          </button>
        </div>

        <div className="mt-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { titulo: 'Peso inicial', valor: resumen.pesoInicial },
            { titulo: 'Peso actual', valor: resumen.pesoActual },
            { titulo: 'Peso objetivo', valor: resumen.pesoObjetivo },
          ].map(m => (
            <div key={m.titulo} className="min-w-0">
              <p className="text-xs text-slate-500">{m.titulo}</p>
              <p className={`text-4xl font-extrabold tabular-nums ${m.valor === null ? 'text-slate-400' : 'text-slate-900'}`}>
                {m.valor ?? '—'}
                {m.valor !== null && <span className="ml-1 text-base font-bold text-slate-500">kg</span>}
              </p>
            </div>
          ))}
        </div>

        {resumen.avance !== null && (
          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-slate-500">Avance hacia la meta</span>
              <span className="text-xs font-semibold tabular-nums text-slate-800">{resumen.avance} %</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${resumen.avance}%` }}
              />
            </div>
            {resumen.diferencia !== null && (
              <p className="mt-1 text-xs text-slate-500">
                {resumen.diferencia === 0
                  ? 'Sin variación de peso desde el primer control.'
                  : `${resumen.diferencia < 0 ? 'Descenso' : 'Aumento'} de ${Math.abs(resumen.diferencia)} kg desde el primer control.`}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Período ── */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <h2 className="text-base font-bold text-slate-800">Evolución</h2>
        <Tabs
          aria-label="Período de análisis"
          items={PERIODOS.map(p => ({ value: p.valor, label: p.titulo }))}
          value={periodo}
          onChange={v => setPeriodo(v as PeriodoSeguimiento)}
          size="sm"
        />
      </div>

      {/* ── Gráficos ── */}
      <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Peso</h3>
          <p className="text-xs text-slate-500">Meta en línea roja punteada</p>
          <div className="mt-4">
            <GraficaPeso puntos={puntos} pesoObjetivo={meta?.pesoObjetivo ?? null} />
          </div>
        </section>

        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Índice de masa corporal</h3>
          <p className="text-xs text-slate-500">Bandas de referencia OMS al fondo</p>
          <div className="mt-4">
            <GraficaImc puntos={puntos} />
          </div>
        </section>

        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Perímetros</h3>
          <p className="text-xs text-slate-500">Medidas registradas por control</p>
          <div className="mt-4">
            <GraficaMedidas puntos={puntos} />
          </div>
        </section>

        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Adherencia a la dieta</h3>
          <p className="text-xs text-slate-500">Promedio semanal · objetivo 80 %</p>
          <div className="mt-4">
            <GraficaAdherencia semanas={adherencia} />
          </div>
        </section>
      </div>

      {/* ── Línea de tiempo ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Línea de tiempo de consultas</h2>
        <p className="text-xs text-slate-500">Del control más reciente al más antiguo</p>
        <div className="mt-5">
          {isLoading ? (
            <p className="text-xs text-slate-500">Cargando controles…</p>
          ) : (
            <LineaTiempoConsultas controles={controles} />
          )}
        </div>
      </section>

      {/* ── Modal: nuevo control ── */}
      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Nueva consulta de control"
        description="Los perímetros son opcionales; se grafican solo si los registras."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={crear.isPending}
              className="rounded-xl bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
            >
              {crear.isPending ? 'Guardando…' : 'Guardar control'}
            </button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CampoForm id="fecha" label="Fecha" error={errors.fecha?.message}>
              <input id="fecha" type="date" {...register('fecha')} className={claseInput} />
            </CampoForm>
            <CampoForm id="peso" label="Peso" sufijo="kg" error={errors.peso?.message}>
              <input
                id="peso"
                type="number"
                step="0.1"
                min="0"
                placeholder={ultimoPeso ? String(ultimoPeso) : undefined}
                {...register('peso', { valueAsNumber: true })}
                className={claseInput}
              />
            </CampoForm>
            <CampoForm id="talla" label="Talla actual" sufijo="cm" error={errors.talla?.message}>
              <input
                id="talla"
                type="number"
                step="0.1"
                min="0"
                placeholder={tallaBase ? String(tallaBase) : 'Opcional'}
                {...register('talla', { valueAsNumber: true })}
                className={claseInput}
              />
            </CampoForm>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {([
              { id: 'perimetroAbdominal', label: 'Abdominal' },
              { id: 'perimetroCintura', label: 'Cintura' },
              { id: 'perimetroCadera', label: 'Cadera' },
              { id: 'perimetroBrazo', label: 'Brazo' },
            ] as const).map(c => (
              <CampoForm key={c.id} id={c.id} label={c.label} sufijo="cm" error={errors[c.id]?.message}>
                <input
                  id={c.id}
                  type="number"
                  step="0.1"
                  min="0"
                  {...register(c.id, { valueAsNumber: true })}
                  className={claseInput}
                />
              </CampoForm>
            ))}
          </div>

          <Slider
            label="Cumplimiento de la dieta"
            min={1}
            max={5}
            step={1}
            value={cumplimiento}
            onChange={v => setValue('cumplimiento', v, { shouldValidate: true })}
            valueLabel={ETIQUETAS_CUMPLIMIENTO[cumplimiento] ?? '—'}
            marks={[1, 2, 3, 4, 5].map(v => ({ value: v, label: String(v) }))}
          />

          <CampoForm id="observaciones" label="Observaciones" error={errors.observaciones?.message}>
            <textarea
              id="observaciones"
              rows={3}
              {...register('observaciones')}
              placeholder="Cambios reportados, adherencia, eventos relevantes…"
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </CampoForm>
        </form>
      </Modal>

      {/* ── Modal: meta de peso ── */}
      <Modal
        open={editandoMeta}
        onClose={() => setEditandoMeta(false)}
        title="Peso objetivo"
        description="Se dibuja como línea de meta en el gráfico de peso."
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditandoMeta(false)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarMeta}
              className="rounded-xl bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              Guardar meta
            </button>
          </>
        }
      >
        <CampoForm id="meta" label="Peso objetivo" sufijo="kg">
          <input
            id="meta"
            type="number"
            step="0.1"
            min="0"
            value={metaBorrador}
            onChange={e => setMetaBorrador(e.target.value === '' ? '' : Number(e.target.value))}
            className={claseInput}
          />
        </CampoForm>
      </Modal>
    </div>
  )
}
