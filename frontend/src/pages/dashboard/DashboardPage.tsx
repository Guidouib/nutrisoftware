import { type ReactNode, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'

/* ─────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────── */
interface DashboardStats {
  pacientesActivos: number
  citasHoy: number
  citasMes: number
  pacientesMes: number
  evaluacionesMes: number
  dietasGeneradas: number
  recordatoriosMes: number
}
/** Modulos clinicos y su estado. El contador del badge sale de aca. */
const MODULOS = [
  { emoji: '📐', label: 'Antropometría', active: true },
  { emoji: '🔬', label: 'Bioquímica',    active: true },
  { emoji: '🩺', label: 'Clínica',       active: true },
  { emoji: '🥗', label: 'Dietas',        active: true },
  { emoji: '📈', label: 'Seguimiento',   active: true },
  { emoji: '👶', label: 'Pediátrico',    active: true },
  { emoji: '🍽️', label: 'Consumo',       active: true },
]

const EMPTY_STATS: DashboardStats = {
  pacientesActivos: 0, citasHoy: 0, citasMes: 0, pacientesMes: 0,
  evaluacionesMes: 0, dietasGeneradas: 0, recordatoriosMes: 0,
}

function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats').then(r => r.data),
    placeholderData: EMPTY_STATS,
    staleTime: 60_000,
  })
}

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */
const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const FMT_FULL = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const FMT_DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */
export default function DashboardPage() {
  const nav = useNavigate()
  const firstName = useAuthStore(s => s.user?.nombreCompleto?.split(' ')[0] ?? 'Nutricionista')
  const { data = EMPTY_STATS, isPending } = useDashboardStats()
  const now = useMemo(() => new Date(), [])

  const metrics = [
    { icon: <IcoCal />, tint: 'bg-blue-50 text-blue-600', value: data.citasHoy, label: 'Citas hoy', hint: data.citasHoy === 0 ? 'Sin citas programadas' : `${data.citasHoy} programadas`, to: '/citas' },
    { icon: <IcoUser />, tint: 'bg-emerald-50 text-emerald-600', value: data.pacientesActivos, label: 'Pacientes activos', hint: data.pacientesActivos === 0 ? 'Empieza agregando uno' : `${data.pacientesMes} nuevos este mes`, to: '/pacientes' },
    { icon: <IcoClip />, tint: 'bg-violet-50 text-violet-600', value: data.evaluacionesMes, label: 'Evaluaciones este mes', hint: 'Evaluaciones realizadas', to: '/evaluaciones' },
    { icon: <IcoBowl />, tint: 'bg-amber-50 text-amber-600', value: data.dietasGeneradas, label: 'Dietas generadas', hint: 'Planes alimentarios', to: '/dietas' },
  ]

  return (
    <div className="flex w-full flex-1 flex-col gap-6">

      {/* ── Header ── */}
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <IcoCalSm /> {cap(FMT_FULL.format(now))}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            ¡{greeting()}, <span className="text-emerald-600">{firstName}</span>!
          </h1>
          <p className="mt-2 text-sm font-normal text-slate-500">Vista general de tu práctica nutricional</p>
        </div>
        <button
          onClick={() => nav('/citas')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <IcoCal /> Agendar cita
        </button>
      </header>

      {/* ── Fila de métricas: 4 tarjetas idénticas ── */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(m => (
          <MetricCard key={m.label} {...m} loading={isPending} onClick={() => nav(m.to)} />
        ))}
      </div>

      {/* ── Cuerpo: 2/3 + 1/3 ── */}
      <div className="grid w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Izquierda — 2/3 */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card
            title="Citas de hoy"
            subtitle={cap(FMT_DAY.format(now))}
            icon={<IcoCal />}
            className="flex-1"
            action={<LinkBtn label="Ver agenda" onClick={() => nav('/citas')} />}
          >
            <EmptyState
              art={<AgendaArt />}
              title="No hay citas programadas para hoy"
              body="Agenda tu primera cita para comenzar a organizar tu día."
              cta={
                <button
                  onClick={() => nav('/citas')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  <IcoPlus /> Agendar primera cita
                </button>
              }
            />
          </Card>

          <Card title="Actividad reciente" subtitle="Resumen de tu actividad más reciente" icon={<IcoActivity />}>
            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { icon: <IcoUser />, tint: 'bg-emerald-50 text-emerald-600', title: 'Sin pacientes nuevos', body: 'Agrega tu primer paciente' },
                { icon: <IcoClip />, tint: 'bg-violet-50 text-violet-600', title: 'Sin evaluaciones', body: 'Realiza tu primera evaluación' },
                { icon: <IcoBowl />, tint: 'bg-amber-50 text-amber-600', title: 'Sin dietas generadas', body: 'Crea tu primer plan alimentario' },
              ].map(a => (
                <div key={a.title} className="flex items-start gap-3 py-4 sm:px-5 sm:py-2 sm:first:pl-0 sm:last:pr-0">
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${a.tint}`}>{a.icon}</span>
                  <div className="min-w-0 flex flex-col gap-1">
                    <p className="truncate text-base font-bold text-slate-800">{a.title}</p>
                    <p className="truncate text-xs font-normal text-slate-500 md:text-sm">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Derecha — 1/3 */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card title="Acciones rápidas" icon={<IcoBolt />}>
            <div className="flex flex-col">
              {[
                { icon: <IcoCal />, tint: 'bg-blue-50 text-blue-600', title: 'Nueva cita', body: 'Agendar consulta', to: '/citas' },
                { icon: <IcoUser />, tint: 'bg-emerald-50 text-emerald-600', title: 'Nuevo paciente', body: 'Registrar paciente', to: '/pacientes' },
                { icon: <IcoClip />, tint: 'bg-violet-50 text-violet-600', title: 'Evaluación nutricional', body: 'Iniciar valoración', to: '/evaluaciones' },
                { icon: <IcoBowl />, tint: 'bg-amber-50 text-amber-600', title: 'Generar dieta', body: 'Plan alimentario', to: '/dietas' },
              ].map((q, i, arr) => (
                <button
                  key={q.title}
                  onClick={() => nav(q.to)}
                  className={`-mx-2 flex items-center gap-3 rounded-xl px-2 py-4 text-left transition-colors hover:bg-slate-50 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${q.tint}`}>{q.icon}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="block truncate text-base font-bold text-slate-800">{q.title}</span>
                    <span className="block truncate text-xs font-normal text-slate-500 md:text-sm">{q.body}</span>
                  </span>
                  <IcoChevron />
                </button>
              ))}
            </div>
          </Card>

          <Card
            title="Módulos clínicos"
            icon={<IcoModules />}
            action={
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {MODULOS.filter(m => m.active).length} activos
              </span>
            }
          >
            <div className="grid grid-cols-3 gap-3">
              {MODULOS.map(mod => (
                <div
                  key={mod.label}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border bg-white p-4 text-center ${
                    mod.active
                      ? 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer transition-colors'
                      : 'border-slate-100 opacity-60'
                  }`}
                >
                  <span className="text-2xl leading-none">{mod.emoji}</span>
                  <span className="text-xs font-bold leading-snug text-slate-800 md:text-sm">{mod.label}</span>
                  {!mod.active && <span className="text-xs font-normal text-slate-400">Próximamente</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   COMPONENTES REUTILIZABLES
   ───────────────────────────────────────────── */
function MetricCard({
  icon, tint, value, label, hint, loading, onClick,
}: {
  icon: ReactNode; tint: string; value: number; label: string; hint: string; loading?: boolean; onClick?: () => void
}) {
  const isZero = value === 0
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>{icon}</span>
        <IcoChevron className="mt-1 text-slate-300 transition-colors group-hover:text-slate-400" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {loading
          ? <div className="skeleton h-10 w-14 rounded-lg" />
          : <p className={`text-4xl font-extrabold tabular-nums leading-none ${isZero ? 'text-slate-400' : 'text-slate-900'}`}>{value}</p>}
        <p className="text-base font-bold leading-snug text-slate-800">{label}</p>
        <p className="text-xs font-normal text-slate-500 md:text-sm">{hint}</p>
      </div>
    </button>
  )
}

function Card({
  title, subtitle, icon, action, className = '', children,
}: {
  title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode; className?: string; children: ReactNode
}) {
  return (
    <section className={`flex w-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}>
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">{icon}</span>}
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="truncate text-xs font-normal text-slate-500 md:text-sm">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </header>
      <div className="flex flex-1 flex-col p-6">{children}</div>
    </section>
  )
}

function EmptyState({ art, title, body, cta }: { art: ReactNode; title: string; body: string; cta: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      {art}
      <p className="mt-2 text-lg font-bold text-slate-800">{title}</p>
      <p className="max-w-[40ch] text-xs font-normal text-slate-500 md:text-sm">{body}</p>
      <div className="mt-2">{cta}</div>
    </div>
  )
}

function LinkBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800">
      {label} <IcoChevron className="text-emerald-700" />
    </button>
  )
}

/* ─────────────────────────────────────────────
   ICONS
   ───────────────────────────────────────────── */
const I = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', 'aria-hidden': true } as const

function IcoCal() {
  return <svg {...I}><rect x="2" y="3" width="14" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" /><path d="M6 1.5v3M12 1.5v3M2 7h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function IcoCalSm() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden><rect x="1.5" y="2.5" width="10" height="9" rx="1.8" stroke="currentColor" strokeWidth="1.4" /><path d="M4.5 1v2M8.5 1v2M1.5 5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
}
function IcoUser() {
  return <svg {...I}><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 15c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function IcoClip() {
  return <svg {...I}><rect x="3" y="3" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M6.5 3V4.5a.6.6 0 00.6.6h3.8a.6.6 0 00.6-.6V3" stroke="currentColor" strokeWidth="1.6" /><path d="M6 8.5h6M6 11.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function IcoBowl() {
  return <svg {...I}><ellipse cx="9" cy="5.5" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M3 5.5v6c0 1.6 2.7 3 6 3s6-1.4 6-3v-6" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9c0 1.6 2.7 3 6 3s6-1.4 6-3" stroke="currentColor" strokeWidth="1.5" /></svg>
}
function IcoActivity() {
  return <svg {...I}><path d="M2 9h3l2-5 4 10 2-5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IcoBolt() {
  return <svg {...I}><path d="M10 1.5L3.5 10H8l-1 6.5L14.5 8H10l0-6.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
}
function IcoModules() {
  return <svg {...I}><rect x="2" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" /><rect x="10" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" /><rect x="2" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" /><rect x="10" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" /></svg>
}
function IcoPlus() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}
function IcoChevron({ className = 'text-slate-300' }: { className?: string }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`flex-shrink-0 ${className}`} aria-hidden><path d="M5 2.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function AgendaArt() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none" aria-hidden>
      <rect x="10" y="12" width="70" height="58" rx="9" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
      <rect x="10" y="12" width="70" height="18" rx="9" fill="#D1FAE5" />
      <rect x="10" y="23" width="70" height="7" fill="#D1FAE5" />
      <rect x="27" y="5" width="5" height="12" rx="2.5" fill="#34D399" />
      <rect x="58" y="5" width="5" height="12" rx="2.5" fill="#34D399" />
      {[22, 36, 50, 64].map(x => [42, 52].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#A7F3D0" />))}
      <circle cx="72" cy="62" r="13" fill="#059669" />
      <path d="M66 62l4 4 8-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
