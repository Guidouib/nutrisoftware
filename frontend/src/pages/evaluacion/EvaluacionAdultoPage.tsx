import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Accordion, AccordionItem } from '../../components/ui/Accordion'
import { Slider } from '../../components/ui/Slider'
import { Tabs } from '../../components/ui/Tabs'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { calcularImc, clasificarImc, edadEnAnios, nivelPorImc } from '../../lib/antropometria'
import { deficienciasSugeridas } from '../../lib/clinica'
import { interpretarValor, parametroPorId } from '../../lib/bioquimica'
import {
  ajustarDistribucion,
  DISTRIBUCION_POR_DEFECTO,
  gastoEnergeticoTotal,
  macrosEnGramos,
  NIVELES_ACTIVIDAD,
  tmbMifflinStJeor,
  type DistribucionMacros,
  type NivelActividad,
} from '../../lib/requerimientos'
import {
  useAntropometrias,
  useBioquimicas,
  useEvaluacionesClinicas,
  useGuardarEvaluacionAdulto,
  usePaciente,
} from '../../hooks/useEvaluacion'
import { nuevoId } from '../../services/localRepo'
import type { ItemRecordatorio, ModalidadConsulta } from '../../types/evaluacion'
import { TIEMPOS_COMIDA } from '../../lib/dieta'

const LIMITE_PRESCRIPCION = 2000

const hoyIso = () => new Date().toISOString().slice(0, 10)

function recordatorioInicial(): ItemRecordatorio[] {
  const horas = ['07:00', '10:30', '13:00', '16:30', '20:00', '22:00']
  return TIEMPOS_COMIDA.map((tiempo, i) => ({
    id: nuevoId(),
    tiempo,
    hora: horas[i] ?? '',
    descripcion: '',
  }))
}

/* ── Campo numérico simple ───────────────────────────────────── */

function CampoNumero({
  id, label, sufijo, valor, onChange, placeholder,
}: {
  id: string
  label: string
  sufijo?: string
  valor: number | ''
  onChange: (v: number | '') => void
  placeholder?: string
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <label htmlFor={id} className="text-xs text-slate-500">
        {label} {sufijo && <span className="text-text-disabled">({sufijo})</span>}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="0.1"
        inputMode="decimal"
        placeholder={placeholder}
        value={valor}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] tabular-nums text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
  )
}

/* ── Página ───────────────────────────────────────────────────── */

export default function EvaluacionAdultoPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const navigate = useNavigate()

  const { data: paciente } = usePaciente(pacienteId)
  const { data: antropometrias = [] } = useAntropometrias(pacienteId)
  const { data: bioquimicas = [] } = useBioquimicas(pacienteId)
  const { data: clinicas = [] } = useEvaluacionesClinicas(pacienteId)
  const guardar = useGuardarEvaluacionAdulto(pacienteId)

  const sexo = paciente?.sexo ?? 'M'
  const edad = paciente ? edadEnAnios(paciente.fechaNacimiento) : 30

  const [modalidad, setModalidad] = useState<ModalidadConsulta>('presencial')
  const [fecha, setFecha] = useState(hoyIso())
  const [peso, setPeso] = useState<number | ''>('')
  const [talla, setTalla] = useState<number | ''>('')
  const [actividad, setActividad] = useState<NivelActividad>('ligero')
  const [recordatorio, setRecordatorio] = useState<ItemRecordatorio[]>(recordatorioInicial)
  const [diagnostico, setDiagnostico] = useState('')
  const [nutroterapeutica, setNutroterapeutica] = useState('')
  const [kcalObjetivo, setKcalObjetivo] = useState<number | ''>('')
  const [distribucion, setDistribucion] = useState<DistribucionMacros>(DISTRIBUCION_POR_DEFECTO)

  /* ── Datos de otras evaluaciones ── */
  const ultimaAntropometria = antropometrias[0]
  const ultimaBioquimica = bioquimicas[0]
  const ultimaClinica = clinicas[0]

  // Sin peso/talla capturados en esta consulta, se usan los de la última ISAK.
  const pesoEfectivo = peso !== '' ? peso : (ultimaAntropometria?.medidas.peso ?? null)
  const tallaEfectiva = talla !== '' ? talla : (ultimaAntropometria?.medidas.talla ?? null)

  const imc = calcularImc(pesoEfectivo, tallaEfectiva)

  const get = useMemo(
    () => (pesoEfectivo && tallaEfectiva ? gastoEnergeticoTotal(pesoEfectivo, tallaEfectiva, edad, sexo, actividad) : null),
    [pesoEfectivo, tallaEfectiva, edad, sexo, actividad]
  )
  const tmb = useMemo(
    () => (pesoEfectivo && tallaEfectiva ? tmbMifflinStJeor(pesoEfectivo, tallaEfectiva, edad, sexo) : null),
    [pesoEfectivo, tallaEfectiva, edad, sexo]
  )

  const kcalFinal = kcalObjetivo !== '' ? kcalObjetivo : (get ?? 0)
  const macros = macrosEnGramos(kcalFinal, distribucion)

  /* ── Hallazgos bioquímicos fuera de rango ── */
  const alterados = useMemo(() => {
    if (!ultimaBioquimica) return []
    return ultimaBioquimica.valores
      .map(v => {
        const parametro = parametroPorId(v.parametroId)
        if (!parametro || v.valor === null) return null
        const nivel = interpretarValor(parametro, v.valor, sexo)
        return nivel === 'optimo' || nivel === 'neutro' ? null : { parametro, valor: v.valor, nivel }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [ultimaBioquimica, sexo])

  const deficiencias = useMemo(
    () =>
      ultimaClinica
        ? deficienciasSugeridas(ultimaClinica.signos.filter(s => s.presente).map(s => s.signoId))
        : [],
    [ultimaClinica]
  )

  /* ── Recordatorio 24 h ── */
  const actualizarItem = (id: string, campo: keyof ItemRecordatorio, valor: string) =>
    setRecordatorio(prev =>
      prev.map(i => (i.id === id ? { ...i, [campo]: campo === 'kcalAprox' ? Number(valor) || undefined : valor } : i))
    )

  const agregarFila = () =>
    setRecordatorio(prev => [...prev, { id: nuevoId(), tiempo: 'Colación', hora: '', descripcion: '' }])

  const quitarFila = (id: string) => setRecordatorio(prev => prev.filter(i => i.id !== id))

  /* ── Guardado ── */
  const payload = () => ({
    pacienteId: pacienteId!,
    fecha,
    modalidad,
    peso: pesoEfectivo ?? undefined,
    talla: tallaEfectiva ?? undefined,
    imc,
    recordatorio24h: recordatorio.filter(i => i.descripcion.trim() !== ''),
    diagnostico,
    prescripcionNutroterapeutica: nutroterapeutica,
    requerimientoKcal: kcalFinal,
    porcentajeProteinas: distribucion.proteinas,
    porcentajeCarbohidratos: distribucion.carbohidratos,
    porcentajeGrasas: distribucion.grasas,
  })

  const puedeGuardar = Boolean(pacienteId) && kcalFinal > 0

  const onGuardar = async () => {
    if (!puedeGuardar) return
    await guardar.mutateAsync(payload())
  }

  const onGuardarYCrearDieta = async () => {
    if (!puedeGuardar) return
    await guardar.mutateAsync(payload())
    navigate(`/dietas/${pacienteId}/nueva`)
  }

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
            Evaluación de adulto
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente
              ? `${paciente.nombre} ${paciente.apellido} · ${edad} años · ${sexo === 'M' ? 'Masculino' : 'Femenino'}`
              : 'Cargando paciente…'}
          </p>
        </div>

        <Tabs
          aria-label="Modalidad de consulta"
          items={[
            { value: 'presencial', label: 'Presencial' },
            { value: 'virtual', label: 'Virtual' },
          ]}
          value={modalidad}
          onChange={v => setModalidad(v as ModalidadConsulta)}
        />
      </header>

      {/* ── Resumen ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800">Estado nutricional</h2>
            <p className="text-xs text-slate-500">
              {modalidad === 'presencial'
                ? 'Medidas tomadas en consultorio'
                : 'Medidas reportadas por el paciente — confirmar en la próxima consulta presencial'}
            </p>
          </div>
          <SemaforoBadge nivel={nivelPorImc(imc)}>{clasificarImc(imc) ?? 'Sin diagnóstico'}</SemaforoBadge>
        </div>

        <div className="mt-5 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { titulo: 'IMC', valor: imc?.toString() ?? '—', unidad: 'kg/m²' },
            { titulo: 'TMB (Mifflin-St Jeor)', valor: tmb?.toString() ?? '—', unidad: 'kcal' },
            { titulo: 'Gasto energético total', valor: get?.toString() ?? '—', unidad: 'kcal' },
            { titulo: 'Objetivo prescrito', valor: kcalFinal > 0 ? String(kcalFinal) : '—', unidad: 'kcal' },
          ].map(m => (
            <div key={m.titulo} className="min-w-0">
              <p className="text-xs text-slate-500">{m.titulo}</p>
              <p className={`text-4xl font-extrabold tabular-nums ${m.valor === '—' ? 'text-slate-400' : 'text-slate-900'}`}>
                {m.valor}
                {m.valor !== '—' && <span className="ml-1 text-base font-bold text-slate-500">{m.unidad}</span>}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Accordion>
        {/* ── 1. Datos de la consulta ── */}
        <AccordionItem title="Datos de la consulta" subtitle="Fecha, antropometría rápida y actividad física" defaultOpen>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex min-w-0 flex-col">
              <label htmlFor="fecha" className="text-xs text-slate-500">Fecha</label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <CampoNumero
              id="peso"
              label={modalidad === 'presencial' ? 'Peso medido' : 'Peso reportado'}
              sufijo="kg"
              valor={peso}
              onChange={setPeso}
              placeholder={ultimaAntropometria?.medidas.peso ? String(ultimaAntropometria.medidas.peso) : undefined}
            />
            <CampoNumero
              id="talla"
              label={modalidad === 'presencial' ? 'Talla medida' : 'Talla reportada'}
              sufijo="cm"
              valor={talla}
              onChange={setTalla}
              placeholder={ultimaAntropometria?.medidas.talla ? String(ultimaAntropometria.medidas.talla) : undefined}
            />

            <div className="flex min-w-0 flex-col">
              <label htmlFor="actividad" className="text-xs text-slate-500">Nivel de actividad física</label>
              <select
                id="actividad"
                value={actividad}
                onChange={e => setActividad(e.target.value as NivelActividad)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {NIVELES_ACTIVIDAD.map(n => (
                  <option key={n.valor} value={n.valor}>
                    {n.titulo} (×{n.factor})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                {NIVELES_ACTIVIDAD.find(n => n.valor === actividad)?.detalle}
              </p>
            </div>
          </div>

          {modalidad === 'virtual' && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-accent-50 p-4">
              <p className="text-xs text-accent-600">
                Consulta virtual: los pliegues y perímetros no se registran. El diagnóstico se apoya en el
                peso y la talla que reporta el paciente y en la última evaluación presencial disponible.
              </p>
            </div>
          )}
        </AccordionItem>

        {/* ── 2. Recordatorio 24 h ── */}
        <AccordionItem
          title="Recordatorio de 24 horas"
          subtitle="Ingesta del día previo, por tiempo de comida"
          right={<span className="text-xs text-slate-500">{recordatorio.filter(r => r.descripcion.trim()).length} registrados</span>}
        >
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Tiempo', 'Hora', 'Descripción de lo consumido', 'kcal aprox.', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recordatorio.map(item => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-0">
                    <td className="min-w-0 px-3 py-2">
                      <input
                        value={item.tiempo}
                        onChange={e => actualizarItem(item.id, 'tiempo', e.target.value)}
                        aria-label="Tiempo de comida"
                        className="h-9 w-32 rounded-lg border border-border bg-white px-2 text-[13px] focus:border-primary-500 focus:outline-none"
                      />
                    </td>
                    <td className="min-w-0 px-3 py-2">
                      <input
                        type="time"
                        value={item.hora}
                        onChange={e => actualizarItem(item.id, 'hora', e.target.value)}
                        aria-label="Hora"
                        className="h-9 w-28 rounded-lg border border-border bg-white px-2 text-[13px] focus:border-primary-500 focus:outline-none"
                      />
                    </td>
                    <td className="min-w-0 px-3 py-2">
                      <input
                        value={item.descripcion}
                        onChange={e => actualizarItem(item.id, 'descripcion', e.target.value)}
                        placeholder="Ej. 1 taza de avena con leche y plátano"
                        aria-label="Descripción"
                        className="h-9 w-full min-w-0 rounded-lg border border-border bg-white px-2 text-[13px] placeholder:text-text-disabled focus:border-primary-500 focus:outline-none"
                      />
                    </td>
                    <td className="min-w-0 px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.kcalAprox ?? ''}
                        onChange={e => actualizarItem(item.id, 'kcalAprox', e.target.value)}
                        aria-label="Kilocalorías aproximadas"
                        className="h-9 w-24 rounded-lg border border-border bg-white px-2 text-[13px] tabular-nums focus:border-primary-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => quitarFila(item.id)}
                        aria-label={`Quitar ${item.tiempo}`}
                        className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={agregarFila}
            className="mt-4 rounded-xl border border-border bg-white px-3 py-2 text-[13px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            + Agregar tiempo de comida
          </button>
        </AccordionItem>

        {/* ── 3. Diagnóstico integrado ── */}
        <AccordionItem
          title="Diagnóstico nutricional integrado"
          subtitle="Cruce de antropometría, bioquímica y evaluación clínica"
          defaultOpen
        >
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Antropometría */}
            <div className="min-w-0 rounded-xl border border-border bg-canvas p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Antropometría</p>
              {ultimaAntropometria ? (
                <>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-900">
                    {ultimaAntropometria.resultado.imc ?? '—'}
                    <span className="ml-1 text-xs font-bold text-slate-500">kg/m²</span>
                  </p>
                  <div className="mt-1.5">
                    <SemaforoBadge size="sm" nivel={nivelPorImc(ultimaAntropometria.resultado.imc)}>
                      {ultimaAntropometria.resultado.clasificacionImc ?? 'Sin dato'}
                    </SemaforoBadge>
                  </div>
                  {ultimaAntropometria.resultado.porcentajeGrasa !== null && (
                    <p className="mt-2 text-xs text-slate-500">
                      Grasa corporal {ultimaAntropometria.resultado.porcentajeGrasa} %
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Sin ISAK registrada.{' '}
                  <Link to={`/evaluacion/${pacienteId}/antropometria`} className="font-medium text-primary-600">
                    Registrar ahora
                  </Link>
                </p>
              )}
            </div>

            {/* Bioquímica */}
            <div className="min-w-0 rounded-xl border border-border bg-canvas p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bioquímica</p>
              {ultimaBioquimica ? (
                alterados.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">Todos los parámetros dentro de rango.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {alterados.slice(0, 4).map(a => (
                      <li key={a.parametro.id} className="flex min-w-0 items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-xs text-slate-800">{a.parametro.nombre}</span>
                        <SemaforoBadge size="sm" nivel={a.nivel}>
                          {a.valor} {a.parametro.unidad}
                        </SemaforoBadge>
                      </li>
                    ))}
                    {alterados.length > 4 && (
                      <li className="text-xs text-slate-500">+{alterados.length - 4} parámetro(s) más</li>
                    )}
                  </ul>
                )
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Sin laboratorio registrado.{' '}
                  <Link to={`/evaluacion/${pacienteId}/bioquimica`} className="font-medium text-primary-600">
                    Registrar ahora
                  </Link>
                </p>
              )}
            </div>

            {/* Clínica */}
            <div className="min-w-0 rounded-xl border border-border bg-canvas p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signos clínicos</p>
              {ultimaClinica ? (
                deficiencias.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">Sin signos carenciales marcados.</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {deficiencias.slice(0, 6).map(d => (
                      <li key={d.nutriente}>
                        <SemaforoBadge size="sm" nivel={d.signos.length > 1 ? 'critico' : 'precaucion'}>
                          {d.nutriente}
                        </SemaforoBadge>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Sin evaluación clínica.{' '}
                  <Link to={`/evaluacion/${pacienteId}/clinica`} className="font-medium text-primary-600">
                    Registrar ahora
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex min-w-0 flex-col">
            <label htmlFor="diagnostico" className="text-xs text-slate-500">Diagnóstico nutricional</label>
            <textarea
              id="diagnostico"
              rows={3}
              value={diagnostico}
              onChange={e => setDiagnostico(e.target.value)}
              placeholder="Ej. Sobrepeso grado I con distribución androide, anemia ferropénica leve y adherencia irregular al plan previo."
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </AccordionItem>

        {/* ── 4. Prescripción nutroterapéutica ── */}
        <AccordionItem
          title="Prescripción nutroterapéutica"
          subtitle="Indicaciones, suplementación y pautas de conducta alimentaria"
        >
          <div className="flex min-w-0 flex-col">
            <label htmlFor="nutro" className="text-xs text-slate-500">Indicaciones para el paciente</label>
            <textarea
              id="nutro"
              rows={7}
              maxLength={LIMITE_PRESCRIPCION}
              value={nutroterapeutica}
              onChange={e => setNutroterapeutica(e.target.value)}
              placeholder="Suplementación, horarios, técnicas culinarias, hidratación, señales de alarma…"
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p
              className={`mt-1 text-right text-xs ${
                nutroterapeutica.length > LIMITE_PRESCRIPCION * 0.9 ? 'text-accent-600' : 'text-slate-500'
              }`}
            >
              {nutroterapeutica.length} / {LIMITE_PRESCRIPCION} caracteres
            </p>
          </div>
        </AccordionItem>

        {/* ── 5. Prescripción dietoterapéutica ── */}
        <AccordionItem
          title="Prescripción dietoterapéutica"
          subtitle="Requerimiento calórico y distribución de macronutrientes"
          defaultOpen
          right={
            <SemaforoBadge size="sm" nivel={kcalFinal > 0 ? 'optimo' : 'neutro'}>
              {kcalFinal > 0 ? `${kcalFinal} kcal/día` : 'Sin definir'}
            </SemaforoBadge>
          }
        >
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="min-w-0">
              <CampoNumero
                id="kcal"
                label="Requerimiento calórico"
                sufijo="kcal/día"
                valor={kcalObjetivo}
                onChange={setKcalObjetivo}
                placeholder={get ? String(get) : '—'}
              />
              {get !== null && (
                <button
                  type="button"
                  onClick={() => setKcalObjetivo(get)}
                  className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  Usar el gasto calculado ({get} kcal)
                </button>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
              {([
                { clave: 'proteinas', titulo: 'Proteínas', gramos: macros.proteinasG },
                { clave: 'carbohidratos', titulo: 'Carbohidratos', gramos: macros.carbohidratosG },
                { clave: 'grasas', titulo: 'Grasas', gramos: macros.grasasG },
              ] as const).map(m => (
                <Slider
                  key={m.clave}
                  label={m.titulo}
                  min={5}
                  max={70}
                  value={distribucion[m.clave]}
                  onChange={v => setDistribucion(d => ajustarDistribucion(d, m.clave, v))}
                  valueLabel={`${distribucion[m.clave]} % · ${m.gramos} g`}
                />
              ))}
              <p className="text-xs text-slate-500">
                Los tres porcentajes se reajustan entre sí para sumar siempre 100 %.
              </p>
            </div>
          </div>
        </AccordionItem>
      </Accordion>

      {/* ── Acciones ── */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {!puedeGuardar && (
          <p className="text-xs text-slate-500">
            Define el requerimiento calórico para poder guardar.
          </p>
        )}
        {guardar.isError && <p className="text-xs text-red-500">No se pudo guardar. Reintenta.</p>}
        {guardar.isSuccess && !guardar.isPending && (
          <p className="text-xs text-primary-600">Evaluación guardada.</p>
        )}

        <button
          type="button"
          onClick={onGuardar}
          disabled={!puedeGuardar || guardar.isPending}
          className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-canvas disabled:pointer-events-none disabled:opacity-50"
        >
          {guardar.isPending ? 'Guardando…' : 'Guardar evaluación'}
        </button>

        <button
          type="button"
          onClick={onGuardarYCrearDieta}
          disabled={!puedeGuardar || guardar.isPending}
          className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
        >
          Ir a crear dieta →
        </button>
      </div>
    </div>
  )
}
