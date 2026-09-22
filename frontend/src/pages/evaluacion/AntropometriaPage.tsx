import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm, useWatch, type Resolver, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accordion, AccordionItem } from '../../components/ui/Accordion'
import { Tabs } from '../../components/ui/Tabs'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { SomatocartaChart } from '../../components/evaluacion/SomatocartaChart'
import {
  camposDeNivel,
  edadEnAnios,
  evaluarAntropometria,
  GRUPOS_ISAK,
  NIVELES_ISAK,
  nivelPorIcc,
  nivelPorImc,
  type CampoISAK,
} from '../../lib/antropometria'
import { esquemaAntropometria, type FormAntropometria } from '../../schemas/evaluacion.schema'
import {
  useAntropometrias,
  useGuardarAntropometria,
  usePaciente,
} from '../../hooks/useEvaluacion'
import type { Antropometria, NivelISAK } from '../../types/evaluacion'

const hoyIso = () => new Date().toISOString().slice(0, 10)

function formatoFecha(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── Campo numérico del formulario ───────────────────────────── */

interface CampoMedidaProps {
  campo: CampoISAK
  register: UseFormRegister<FormAntropometria>
  error?: string
}

function CampoMedida({ campo, register, error }: CampoMedidaProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <label htmlFor={`medida-${campo.id}`} className="text-xs text-slate-500">
        {campo.label} <span className="text-text-disabled">({campo.unidad})</span>
      </label>
      <input
        id={`medida-${campo.id}`}
        type="number"
        step="0.1"
        min="0"
        max={campo.max}
        inputMode="decimal"
        aria-invalid={Boolean(error)}
        {...register(`medidas.${campo.id}`, { valueAsNumber: true })}
        className={[
          'mt-1 h-10 w-full rounded-xl border bg-white px-3 text-[13px] text-text-primary tabular-nums',
          'transition-all duration-150 focus:outline-none focus:ring-2',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-border focus:border-primary-500 focus:ring-primary-500/20',
        ].join(' ')}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ── Métrica del panel de resultados ─────────────────────────── */

function Metrica({ titulo, valor, unidad, pie }: { titulo: string; valor: string; unidad?: string; pie?: string }) {
  const vacia = valor === '—'
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className={`text-4xl font-extrabold tabular-nums ${vacia ? 'text-slate-400' : 'text-slate-900'}`}>
        {valor}
        {unidad && !vacia && <span className="ml-1 text-base font-bold text-slate-500">{unidad}</span>}
      </p>
      {pie && <p className="mt-0.5 truncate text-xs text-slate-500">{pie}</p>}
    </div>
  )
}

/* ── Página ───────────────────────────────────────────────────── */

export default function AntropometriaPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const [nivel, setNivel] = useState<NivelISAK>(1)

  const { data: paciente } = usePaciente(pacienteId)
  const { data: historial = [], isLoading: cargandoHistorial } = useAntropometrias(pacienteId)
  const guardar = useGuardarAntropometria(pacienteId)

  const sexo = paciente?.sexo ?? 'M'
  const edad = paciente ? edadEnAnios(paciente.fechaNacimiento) : 30

  const resolver = useMemo(
    // El esquema se regenera por nivel; el cast salva la brecha entre el tipo
    // de entrada de Zod (unknown por `preprocess`) y el del formulario.
    () => zodResolver(esquemaAntropometria(nivel)) as unknown as Resolver<FormAntropometria>,
    [nivel]
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormAntropometria>({
    resolver,
    defaultValues: { fecha: hoyIso(), observaciones: '', medidas: {} },
  })

  const medidas = useWatch({ control, name: 'medidas' })

  // Cálculo en tiempo real: cada tecla recalcula IMC, grasa, ICC y somatotipo.
  const resultado = useMemo(
    () => evaluarAntropometria(medidas ?? {}, sexo, edad),
    [medidas, sexo, edad]
  )

  const campos = camposDeNivel(nivel)
  const gruposVisibles = GRUPOS_ISAK.filter(g => campos.some(c => c.grupo === g.id))

  const historicoSomatotipos = historial
    .filter((h): h is Antropometria & { resultado: { somatotipo: NonNullable<Antropometria['resultado']['somatotipo']> } } =>
      h.resultado?.somatotipo != null
    )
    .map(h => ({ somatotipo: h.resultado.somatotipo, fecha: h.fecha }))

  const onSubmit = handleSubmit(async valores => {
    if (!pacienteId) return
    await guardar.mutateAsync({
      pacienteId,
      fecha: valores.fecha,
      nivelIsak: nivel,
      medidas: valores.medidas,
      resultado,
      observaciones: valores.observaciones,
    })
    reset({ fecha: hoyIso(), observaciones: '', medidas: {} })
  })

  const erroresMedidas = errors.medidas as Record<string, { message?: string }> | undefined

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
            Antropometría ISAK
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente
              ? `${paciente.nombre} ${paciente.apellido} · ${edad} años · ${sexo === 'M' ? 'Masculino' : 'Femenino'}`
              : 'Cargando paciente…'}
          </p>
        </div>

        <Tabs
          aria-label="Nivel ISAK"
          items={NIVELES_ISAK.map(n => ({ value: String(n.valor), label: n.titulo }))}
          value={String(nivel)}
          onChange={v => setNivel(Number(v) as NivelISAK)}
        />
      </header>

      <form onSubmit={onSubmit} className="flex w-full min-w-0 flex-col gap-6">
        {/* ── Panel de resultados en vivo ── */}
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800">Resultados en tiempo real</h2>
              <p className="text-xs text-slate-500">
                {NIVELES_ISAK.find(n => n.valor === nivel)?.detalle} · {campos.length} medidas
              </p>
            </div>
            <SemaforoBadge nivel={nivelPorImc(resultado.imc)}>
              {resultado.clasificacionImc ?? 'Sin diagnóstico'}
            </SemaforoBadge>
          </div>

          <div className="mt-5 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            <Metrica titulo="IMC" valor={resultado.imc?.toString() ?? '—'} unidad="kg/m²" />
            <Metrica
              titulo="% Grasa corporal"
              valor={resultado.porcentajeGrasa?.toString() ?? '—'}
              unidad="%"
              pie={resultado.metodoGrasa ?? 'Requiere los 4 pliegues'}
            />
            <Metrica
              titulo="Masa libre de grasa"
              valor={resultado.masaLibreGrasaKg?.toString() ?? '—'}
              unidad="kg"
              pie={resultado.masaGrasaKg !== null ? `Masa grasa ${resultado.masaGrasaKg} kg` : undefined}
            />
            <div className="min-w-0">
              <Metrica titulo="Índice cintura-cadera" valor={resultado.indiceCinturaCadera?.toString() ?? '—'} />
              <div className="mt-1">
                <SemaforoBadge size="sm" nivel={nivelPorIcc(resultado.indiceCinturaCadera, sexo)}>
                  {resultado.indiceCinturaCadera === null
                    ? 'Nivel 2 requerido'
                    : nivelPorIcc(resultado.indiceCinturaCadera, sexo) === 'optimo'
                      ? 'Riesgo bajo'
                      : nivelPorIcc(resultado.indiceCinturaCadera, sexo) === 'precaucion'
                        ? 'Riesgo moderado'
                        : 'Riesgo elevado'}
                </SemaforoBadge>
              </div>
            </div>
          </div>
        </section>

        {/* ── Formulario por secciones ── */}
        <Accordion>
          <AccordionItem
            title="Datos de la medición"
            subtitle="Fecha y observaciones de la toma"
            defaultOpen
          >
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex min-w-0 flex-col">
                <label htmlFor="fecha" className="text-xs text-slate-500">Fecha de medición</label>
                <input
                  id="fecha"
                  type="date"
                  {...register('fecha')}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                {errors.fecha && <p className="mt-1 text-xs text-red-500">{errors.fecha.message}</p>}
              </div>
              <div className="flex min-w-0 flex-col md:col-span-2">
                <label htmlFor="observaciones" className="text-xs text-slate-500">Observaciones</label>
                <input
                  id="observaciones"
                  type="text"
                  placeholder="Condiciones de la toma, hidratación, hora del día…"
                  {...register('observaciones')}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </AccordionItem>

          {gruposVisibles.map((grupo, i) => {
            const delGrupo = campos.filter(c => c.grupo === grupo.id)
            const conError = delGrupo.some(c => erroresMedidas?.[c.id])
            return (
              <AccordionItem
                key={grupo.id}
                title={grupo.titulo}
                subtitle={grupo.descripcion}
                defaultOpen={i === 0}
                right={
                  conError ? (
                    <SemaforoBadge size="sm" nivel="critico">Campos pendientes</SemaforoBadge>
                  ) : (
                    <span className="text-xs text-slate-500">{delGrupo.length} campos</span>
                  )
                }
              >
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {delGrupo.map(campo => (
                    <CampoMedida
                      key={campo.id}
                      campo={campo}
                      register={register}
                      error={erroresMedidas?.[campo.id]?.message}
                    />
                  ))}
                </div>
              </AccordionItem>
            )
          })}
        </Accordion>

        {/* ── Somatocarta ── */}
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800">Somatocarta — Heath-Carter</h2>
              <p className="text-xs text-slate-500">
                {resultado.somatotipo
                  ? `${resultado.somatotipo.categoria} · ${resultado.somatotipo.endomorfia} – ${resultado.somatotipo.mesomorfia} – ${resultado.somatotipo.ectomorfia}`
                  : 'Endomorfia – Mesomorfia – Ectomorfia'}
              </p>
            </div>
            {historicoSomatotipos.length > 0 && (
              <span className="text-xs text-slate-500">
                {historicoSomatotipos.length} medición(es) previa(s) en gris
              </span>
            )}
          </div>
          <div className="mt-4">
            <SomatocartaChart actual={resultado.somatotipo} historico={historicoSomatotipos} />
          </div>
        </section>

        {/* ── Guardar ── */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {guardar.isError && (
            <p className="text-xs text-red-500">No se pudo guardar la evaluación. Reintenta.</p>
          )}
          {guardar.isSuccess && !guardar.isPending && (
            <p className="text-xs text-primary-600">Evaluación guardada.</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || guardar.isPending}
            className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
          >
            {guardar.isPending ? 'Guardando…' : 'Guardar evaluación'}
          </button>
        </div>
      </form>

      {/* ── Historial ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Mediciones previas</h2>
        <p className="text-xs text-slate-500">Historial antropométrico del paciente</p>

        {cargandoHistorial ? (
          <p className="mt-4 text-xs text-slate-500">Cargando historial…</p>
        ) : historial.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-1 py-8">
            <p className="text-lg font-bold text-slate-800">Sin mediciones registradas</p>
            <p className="text-xs text-slate-500">La primera evaluación que guardes aparecerá acá.</p>
          </div>
        ) : (
          <div className="mt-4 w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Fecha', 'Nivel', 'IMC', 'Diagnóstico', '% Grasa', 'Somatotipo'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0">
                    <td className="min-w-0 px-3 py-2.5 text-slate-800">{formatoFecha(h.fecha)}</td>
                    <td className="min-w-0 px-3 py-2.5 text-slate-500">Nivel {h.nivelIsak}</td>
                    <td className="min-w-0 px-3 py-2.5 font-semibold tabular-nums text-slate-800">
                      {h.resultado?.imc ?? '—'}
                    </td>
                    <td className="min-w-0 px-3 py-2.5">
                      <SemaforoBadge size="sm" nivel={nivelPorImc(h.resultado?.imc ?? null)}>
                        {h.resultado?.clasificacionImc ?? 'Sin dato'}
                      </SemaforoBadge>
                    </td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">
                      {h.resultado?.porcentajeGrasa !== null && h.resultado?.porcentajeGrasa !== undefined
                        ? `${h.resultado.porcentajeGrasa} %`
                        : '—'}
                    </td>
                    <td className="min-w-0 px-3 py-2.5 text-slate-500">
                      {h.resultado?.somatotipo
                        ? `${h.resultado.somatotipo.endomorfia} – ${h.resultado.somatotipo.mesomorfia} – ${h.resultado.somatotipo.ectomorfia}`
                        : '—'}
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
