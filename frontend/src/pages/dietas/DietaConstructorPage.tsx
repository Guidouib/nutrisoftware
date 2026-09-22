import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Modal } from '../../components/ui/Modal'
import { Switch } from '../../components/ui/Switch'
import { Accordion } from '../../components/ui/Accordion'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { nivelPorCobertura } from '../../lib/semaforo'
import { TabsDias } from '../../components/dietas/TabsDias'
import { TiempoComidaSection } from '../../components/dietas/TiempoComidaSection'
import { BuscadorAlimentosDrawer } from '../../components/dietas/BuscadorAlimentosDrawer'
import {
  aAlimentoEnDieta,
  agregarAlimento,
  cambiarGramos,
  coberturas,
  copiarDia,
  DIAS_SEMANA,
  quitarAlimento,
  totalesDeDia,
} from '../../lib/dieta'
import { KCAL_POR_GRAMO } from '../../lib/requerimientos'
import { useDieta, type EstadoAutoguardado } from '../../hooks/useDieta'
import { usePaciente, useRequerimientos } from '../../hooks/useEvaluacion'
import type { Alimento } from '../../types/alimento'
import type { DiaSemana } from '../../types/dieta'

const COLOR_MACRO = { proteinas: '#0D9F63', carbohidratos: '#2EB97D', grasas: '#F59E0B' }

const textoGuardado: Record<EstadoAutoguardado, string> = {
  inactivo: 'Sin cambios',
  pendiente: 'Cambios sin guardar…',
  guardando: 'Guardando…',
  guardado: 'Todo guardado',
  error: 'Error al guardar',
}

/* ── Barra de cobertura de un macronutriente ─────────────────── */

const colorBarra = { optimo: 'bg-primary-500', precaucion: 'bg-accent-500', critico: 'bg-red-500', neutro: 'bg-slate-300' }

function BarraMacro({
  titulo, actual, objetivo, unidad, porcentaje, diferencia,
}: {
  titulo: string
  actual: number
  objetivo: number
  unidad: string
  porcentaje: number
  diferencia: number
}) {
  const nivel = objetivo > 0 ? nivelPorCobertura(porcentaje) : 'neutro'
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-xs text-slate-500">{titulo}</span>
        <span className="flex-shrink-0 text-xs font-semibold tabular-nums text-slate-800">
          {actual} / {objetivo} {unidad}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorBarra[nivel]}`}
          style={{ width: `${Math.min(100, porcentaje)}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[11px] tabular-nums text-slate-500">{porcentaje} %</span>
        <span className={`text-[11px] tabular-nums ${diferencia === 0 ? 'text-slate-500' : diferencia > 0 ? 'text-accent-600' : 'text-slate-500'}`}>
          {diferencia > 0 ? '+' : ''}{diferencia} {unidad}
        </span>
      </div>
    </div>
  )
}

/* ── Página ───────────────────────────────────────────────────── */

export default function DietaConstructorPage() {
  const { pacienteId, dietaId } = useParams<{ pacienteId: string; dietaId?: string }>()

  const { data: paciente } = usePaciente(pacienteId)
  const { requerimientos, isLoading: cargandoReq } = useRequerimientos(pacienteId)
  const { dieta, actualizar, cargando, estadoGuardado, guardarAhora } = useDieta(
    pacienteId,
    dietaId,
    requerimientos
  )

  const [diaActivo, setDiaActivo] = useState<DiaSemana>(0)
  const [tiempoDestino, setTiempoDestino] = useState<string | null>(null)
  const [copiarAbierto, setCopiarAbierto] = useState(false)
  const [destinosCopia, setDestinosCopia] = useState<DiaSemana[]>([])

  const dia = dieta?.dias.find(d => d.diaSemana === diaActivo) ?? null
  const totales = dia ? totalesDeDia(dia) : null

  // Sin useMemo: son sumas sobre un puñado de filas, mucho más baratas que
  // memoizarlas, y así el compilador de React puede optimizar el componente.
  const filas = totales && dieta ? coberturas(totales, dieta.requerimientos) : []

  const datosDonut = totales
    ? [
        { nombre: 'Proteínas', valor: totales.proteinas * KCAL_POR_GRAMO.proteinas, color: COLOR_MACRO.proteinas },
        { nombre: 'Carbohidratos', valor: totales.carbohidratos * KCAL_POR_GRAMO.carbohidratos, color: COLOR_MACRO.carbohidratos },
        { nombre: 'Grasas', valor: totales.grasas * KCAL_POR_GRAMO.grasas, color: COLOR_MACRO.grasas },
      ].filter(d => d.valor > 0)
    : []

  const nombreTiempo = dia?.tiempos.find(t => t.id === tiempoDestino)?.nombre ?? ''

  /* ── Handlers ── */

  const onAgregarAlimento = (alimento: Alimento, gramos: number) => {
    if (!tiempoDestino) return
    actualizar(d => agregarAlimento(d, diaActivo, tiempoDestino, aAlimentoEnDieta(alimento, gramos)))
  }

  const onCambiarGramos = (tiempoId: string, itemId: string, gramos: number) =>
    actualizar(d => cambiarGramos(d, diaActivo, tiempoId, itemId, gramos))

  const onQuitar = (tiempoId: string, itemId: string) =>
    actualizar(d => quitarAlimento(d, diaActivo, tiempoId, itemId))

  const confirmarCopia = () => {
    if (destinosCopia.length > 0) actualizar(d => copiarDia(d, diaActivo, destinosCopia))
    setCopiarAbierto(false)
    setDestinosCopia([])
  }

  /* ── Estados de carga y prerrequisitos ── */

  if (cargandoReq || cargando) {
    return (
      <div className="flex w-full flex-1 flex-col gap-6">
        <p className="text-xs text-slate-500">Cargando plan nutricional…</p>
      </div>
    )
  }

  if (!requerimientos) {
    return (
      <div className="flex w-full flex-1 flex-col gap-6">
        <header className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Constructor de dieta</h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente ? `${paciente.nombre} ${paciente.apellido}` : ''}
          </p>
        </header>
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-bold text-slate-800">Faltan los requerimientos del paciente</p>
            <p className="max-w-md text-xs text-slate-500">
              El constructor toma las kcal y el reparto de macronutrientes de la última evaluación de
              adulto registrada. Completa esa evaluación para habilitar el plan semanal.
            </p>
            <Link
              to={`/evaluacion/${pacienteId}/adulto`}
              className="mt-3 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              Ir a la evaluación de adulto
            </Link>
          </div>
        </section>
      </div>
    )
  }

  if (!dieta || !dia || !totales) return null

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
            {dieta.nombre}
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente ? `${paciente.nombre} ${paciente.apellido}` : ''} · Plan de 7 días
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs ${
              estadoGuardado === 'error' ? 'text-red-500'
              : estadoGuardado === 'guardado' ? 'text-primary-600'
              : 'text-slate-500'
            }`}
          >
            {textoGuardado[estadoGuardado]}
          </span>
          <Link
            to={`/dietas/${pacienteId}/${dieta.id}/exportar`}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas"
          >
            Exportar PDF
          </Link>
        </div>
      </header>

      {/* ── Requerimientos (panel fijo) ── */}
      <section className="sticky top-0 z-20 mb-6 w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800">Requerimientos del paciente</h2>
            <p className="text-xs text-slate-500">
              Última evaluación activa · cobertura del {DIAS_SEMANA[diaActivo].largo.toLowerCase()}
            </p>
          </div>
          <SemaforoBadge nivel={nivelPorCobertura(filas[0]?.porcentaje ?? 0)}>
            {totales.energia} de {dieta.requerimientos.kcal} kcal
          </SemaforoBadge>
        </div>

        <div className="mt-5 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filas.map(f => (
            <BarraMacro key={f.clave} titulo={f.titulo} actual={f.actual} objetivo={f.objetivo} unidad={f.unidad} porcentaje={f.porcentaje} diferencia={f.diferencia} />
          ))}
        </div>
      </section>

      {/* ── Día + acciones ── */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <TabsDias dias={dieta.dias} diaActivo={diaActivo} onCambiar={setDiaActivo} />

        <div className="flex flex-wrap items-center gap-4">
          <Switch
            checked={dieta.modoIntercambios}
            onChange={v => actualizar(d => ({ ...d, modoIntercambios: v }))}
            label="Modo intercambios SMAE"
          />
          <button
            type="button"
            onClick={() => setCopiarAbierto(true)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas"
          >
            Copiar este día a…
          </button>
        </div>
      </div>

      {/* ── Tiempos de comida ── */}
      <Accordion>
        {dia.tiempos.map((tiempo, i) => (
          <TiempoComidaSection
            key={tiempo.id}
            tiempo={tiempo}
            defaultOpen={i === 0}
            onAgregar={setTiempoDestino}
            onCambiarGramos={onCambiarGramos}
            onQuitar={onQuitar}
          />
        ))}
      </Accordion>

      {/* ── Totales del día ── */}
      <section className="mt-4 w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">
          Totales del {DIAS_SEMANA[diaActivo].largo.toLowerCase()}
        </h2>
        <p className="text-xs text-slate-500">Objetivo vs. registrado</p>

        <div className="mt-5 grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
              {filas.map(f => (
                <div key={f.clave} className="min-w-0">
                  <p className="text-xs text-slate-500">{f.titulo}</p>
                  <p className={`text-4xl font-extrabold tabular-nums ${f.actual === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                    {f.actual}
                    <span className="ml-1 text-base font-bold text-slate-500">{f.unidad}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Objetivo {f.objetivo} · {f.diferencia > 0 ? '+' : ''}{f.diferencia} {f.unidad}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Fibra total del día: {totales.fibra} g</p>
          </div>

          <div className="min-w-0">
            {datosDonut.length === 0 ? (
              <div className="flex h-[200px] w-full items-center justify-center rounded-xl bg-canvas md:h-[300px]">
                <p className="px-6 text-center text-xs text-slate-500">
                  Agrega alimentos para ver la distribución de macronutrientes.
                </p>
              </div>
            ) : (
              <div className="h-[200px] w-full min-w-0 md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosDonut}
                      dataKey="valor"
                      nameKey="nombre"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {datosDonut.map(d => (
                        <Cell key={d.nombre} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(valor, nombre) => [`${Math.round(Number(valor) || 0)} kcal`, String(nombre)]}
                      contentStyle={{ borderRadius: 12, border: '1px solid #E4EAE6', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {Object.entries(COLOR_MACRO).map(([nombre, color]) => (
                <span key={nombre} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
                  {nombre === 'proteinas' ? 'Proteínas' : nombre === 'carbohidratos' ? 'Carbohidratos' : 'Grasas'}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={guardarAhora}
            className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
          >
            Guardar ahora
          </button>
        </div>
      </section>

      {/* ── Drawer del buscador ── */}
      <BuscadorAlimentosDrawer
        key={tiempoDestino ?? 'cerrado'}
        open={tiempoDestino !== null}
        onClose={() => setTiempoDestino(null)}
        nombreTiempo={nombreTiempo}
        onAgregar={onAgregarAlimento}
        modoIntercambios={dieta.modoIntercambios}
      />

      {/* ── Copiar día ── */}
      <Modal
        open={copiarAbierto}
        onClose={() => setCopiarAbierto(false)}
        title={`Copiar ${DIAS_SEMANA[diaActivo].largo}`}
        description="El contenido reemplazará por completo los días que elijas."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCopiarAbierto(false)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarCopia}
              disabled={destinosCopia.length === 0}
              className="rounded-xl bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
            >
              Copiar a {destinosCopia.length} día(s)
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          {DIAS_SEMANA.filter(d => d.valor !== diaActivo).map(d => (
            <label
              key={d.valor}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-canvas"
            >
              <input
                type="checkbox"
                checked={destinosCopia.includes(d.valor)}
                onChange={e =>
                  setDestinosCopia(prev =>
                    e.target.checked ? [...prev, d.valor] : prev.filter(x => x !== d.valor)
                  )
                }
                className="h-4 w-4 accent-primary-500"
              />
              <span className="text-[13px] font-medium text-slate-800">{d.largo}</span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}
