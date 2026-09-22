import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { pacientesService } from '../../services/pacientesService'
import { citasService } from '../../services/citasService'
import type { Paciente } from '../../types/paciente'
import type { Cita } from '../../types/cita'

/* ── Helpers ── */
function calcAge(fechaNacimiento: string): number {
  const birth = new Date(fechaNacimiento)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
  return age
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

const tipoCitaLabel: Record<string, string> = {
  primera_vez: 'Primera vez', seguimiento: 'Seguimiento',
  control: 'Control', urgencia: 'Urgencia',
}

const estadoCitaBadge: Record<string, 'success' | 'info' | 'error' | 'neutral' | 'warning'> = {
  programada: 'info', completada: 'success', cancelada: 'neutral', no_asistio: 'warning',
}

const estadoCitaLabel: Record<string, string> = {
  programada: 'Programada', completada: 'Completada',
  cancelada: 'Cancelada', no_asistio: 'No asistió',
}

type Tab = 'info' | 'citas' | 'historial'

/* ═══════════════════════════════════════════════ */
export default function PacienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab]     = useState<Tab>('info')
  const [paciente, setPaciente]       = useState<Paciente | null>(null)
  const [citasPaciente, setCitas]     = useState<Cita[]>([])
  const [notFound, setNotFound]       = useState(false)

  useEffect(() => {
    if (!id) return
    pacientesService.getById(id)
      .then(setPaciente)
      .catch(() => setNotFound(true))
    citasService.getAll(undefined, undefined, id)
      .then(data => setCitas(data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())))
      .catch(console.error)
  }, [id])

  if (notFound) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-xl font-semibold text-text-primary">Paciente no encontrado</p>
      <Button onClick={() => navigate('/pacientes')} className="mt-4" variant="outline">
        ← Volver a Pacientes
      </Button>
    </div>
  )

  if (!paciente) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" aria-hidden />
      <p className="text-[13px] text-text-tertiary">Cargando paciente...</p>
    </div>
  )

  const age = calcAge(paciente!.fechaNacimiento)
  const citasCompletadas = citasPaciente.filter(c => c.estado === 'completada').length
  const citaProxima = citasPaciente.find(c => c.estado === 'programada' && new Date(c.fecha) > new Date())

  return (
    <div className="p-6 max-w-[1320px] mx-auto animate-fade-up">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-5 text-[13px]">
        <Link to="/pacientes" className="text-text-tertiary hover:text-primary-600 transition-colors">
          Pacientes
        </Link>
        <span className="text-text-disabled">/</span>
        <span className="text-text-primary font-medium">{paciente.nombre} {paciente.apellido}</span>
      </div>

      {/* ── 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">

        {/* ── LEFT: main content ── */}
        <div className="min-w-0">

          {/* Hero card */}
          <div className="bg-surface border border-border rounded-2xl mb-5 shadow-xs overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-emerald-400" aria-hidden />
            <div className="p-6">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar name={`${paciente.nombre} ${paciente.apellido}`} size="xl" />
                  <span
                    className={[
                      'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface',
                      paciente.estado === 'activo' ? 'bg-green-500' : 'bg-gray-400',
                    ].join(' ')}
                    aria-hidden
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-bold font-display text-text-primary tracking-tight">
                        {paciente.nombre} {paciente.apellido}
                      </h1>
                      <p className="text-text-tertiary text-sm mt-0.5">
                        {age} años · {paciente.sexo === 'F' ? 'Femenino' : 'Masculino'}
                        {paciente.dni && <span className="ml-2">· DNI {paciente.dni}</span>}
                      </p>
                    </div>
                    <Badge variant={paciente.estado === 'activo' ? 'success' : 'neutral'}>
                      {paciente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  {/* Contact pills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {paciente.email && (
                      <a href={`mailto:${paciente.email}`} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-border text-[12px] text-text-secondary hover:text-primary-600 hover:border-primary-200 transition-all">
                        <IcoEmail />{paciente.email}
                      </a>
                    )}
                    {paciente.telefono && (
                      <a href={`tel:${paciente.telefono}`} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-border text-[12px] text-text-secondary hover:text-primary-600 hover:border-primary-200 transition-all">
                        <IcoPhone />{paciente.telefono}
                      </a>
                    )}
                    {paciente.direccion && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-border text-[12px] text-text-secondary">
                        <IcoLocation />{paciente.direccion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-canvas border border-border rounded-xl p-1 mb-5 w-fit">
            {([
              { key: 'info', label: 'Información' },
              { key: 'citas', label: `Citas (${citasPaciente.length})` },
              { key: 'historial', label: 'Historial clínico' },
            ] as { key: Tab; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'px-4 py-2 rounded-lg text-[13px] font-semibold transition-all',
                  activeTab === tab.key
                    ? 'bg-surface text-text-primary shadow-xs border border-border'
                    : 'text-text-tertiary hover:text-text-primary',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
                <h3 className="text-[13px] font-semibold text-text-primary mb-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0"><IcoUsers /></span>
                  Datos personales
                </h3>
                <dl className="space-y-0">
                  {[
                    { label: 'Nombre completo', value: `${paciente.nombre} ${paciente.apellido}` },
                    { label: 'DNI', value: paciente.dni ?? '—' },
                    { label: 'Fecha de nacimiento', value: new Date(paciente.fechaNacimiento).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) },
                    { label: 'Edad', value: `${age} años` },
                    { label: 'Sexo', value: paciente.sexo === 'F' ? 'Femenino' : 'Masculino' },
                  ].map(d => (
                    <div key={d.label} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                      <dt className="text-[12px] text-text-tertiary">{d.label}</dt>
                      <dd className="text-[13px] font-medium text-text-primary">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
                <h3 className="text-[13px] font-semibold text-text-primary mb-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"><IcoEmail /></span>
                  Contacto
                </h3>
                <dl className="space-y-0">
                  {[
                    { label: 'Email', value: paciente.email ?? '—' },
                    { label: 'Teléfono', value: paciente.telefono ?? '—' },
                    { label: 'Dirección', value: paciente.direccion ?? '—' },
                  ].map(d => (
                    <div key={d.label} className="flex justify-between items-start py-2.5 border-b border-border/50 last:border-0 gap-3">
                      <dt className="text-[12px] text-text-tertiary flex-shrink-0">{d.label}</dt>
                      <dd className="text-[13px] font-medium text-text-primary text-right">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {paciente.notas && (
                <div className="col-span-2 bg-amber-50 border border-amber-200/60 rounded-2xl p-5">
                  <h3 className="text-[13px] font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <IcoInfo /> Notas clínicas
                  </h3>
                  <p className="text-[13px] text-amber-700 leading-relaxed">{paciente.notas}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'citas' && (
            <div className="space-y-3">
              {citasPaciente.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-10 text-center">
                  <p className="text-text-primary font-semibold">Sin citas registradas</p>
                  <Button onClick={() => navigate('/citas')} className="mt-4" size="sm" leftIcon={<IcoCalendar />}>
                    Agendar primera cita
                  </Button>
                </div>
              ) : citasPaciente.map(cita => (
                <div key={cita.id} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 shadow-xs hover:border-primary-200 transition-colors">
                  <div className={[
                    'w-1 self-stretch rounded-full flex-shrink-0',
                    cita.estado === 'completada' ? 'bg-green-500' :
                    cita.estado === 'programada' ? 'bg-blue-500' :
                    cita.estado === 'cancelada' ? 'bg-gray-400' : 'bg-amber-500',
                  ].join(' ')} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-text-primary">
                        {tipoCitaLabel[cita.tipo] ?? cita.tipo}
                      </p>
                      <Badge variant={estadoCitaBadge[cita.estado] ?? 'neutral'}>
                        {estadoCitaLabel[cita.estado] ?? cita.estado}
                      </Badge>
                      <Badge variant={cita.modalidad === 'virtual' ? 'info' : 'neutral'}>
                        {cita.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                      </Badge>
                    </div>
                    <p className="text-[12px] text-text-tertiary mt-0.5">
                      {fmtDate(cita.fecha)} · {fmtTime(cita.fecha)} · {cita.duracionMinutos} min
                    </p>
                    {cita.notas && (
                      <p className="text-[12px] text-text-secondary mt-1 italic">{cita.notas}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-xs">
              <div className="w-12 h-12 bg-canvas rounded-2xl flex items-center justify-center mx-auto mb-3">
                <IcoClipboard />
              </div>
              <p className="text-text-primary font-semibold">Historial clínico</p>
              <p className="text-sm text-text-tertiary mt-1">Evaluaciones, dietas y seguimiento — disponible en Fase 3</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: sticky sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Key stats */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
            <h3 className="text-[12px] font-bold font-display text-text-primary uppercase tracking-wide mb-3">Resumen clínico</h3>
            <div className="space-y-0">
              {[
                { label: 'Consultas realizadas', value: String(citasCompletadas) },
                { label: 'Paciente desde', value: fmtDate(paciente.fechaCreacion) },
                { label: 'Fecha de nacimiento', value: new Date(paciente.fechaNacimiento).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'Estado', value: paciente.estado === 'activo' ? 'Activo' : 'Inactivo' },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                  <span className="text-[11px] text-text-tertiary">{s.label}</span>
                  <span className="text-[12px] font-semibold text-text-primary">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next appointment */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
            <h3 className="text-[12px] font-bold font-display text-text-primary uppercase tracking-wide mb-3">Próxima cita</h3>
            {citaProxima ? (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-3">
                <p className="text-[13px] font-semibold text-primary-700">{tipoCitaLabel[citaProxima.tipo] ?? citaProxima.tipo}</p>
                <p className="text-[12px] text-primary-600 mt-1">{fmtDate(citaProxima.fecha)}</p>
                <p className="text-[11px] text-primary-500 mt-0.5">{fmtTime(citaProxima.fecha)} · {citaProxima.duracionMinutos} min</p>
              </div>
            ) : (
              <p className="text-[12px] text-text-tertiary">Sin citas programadas</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
            <h3 className="text-[12px] font-bold font-display text-text-primary uppercase tracking-wide mb-3">Acciones</h3>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => navigate('/citas')} leftIcon={<IcoCalendar />} className="w-full justify-start">
                Nueva cita
              </Button>
              <Button size="sm" variant="secondary" leftIcon={<IcoClipboard />} className="w-full justify-start">
                Evaluación
              </Button>
              <Button size="sm" variant="outline" leftIcon={<IcoEdit />} className="w-full justify-start">
                Editar paciente
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ── Icons ── */
function IcoEmail()    { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden><rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 4.5l5.5 3.5 5.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IcoPhone()    { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden><path d="M4.5 1.5C4.5 1.5 3 3 3 5s1.5 4 4.5 5.5c1.5 0 2.5-2 2.5-2l-2-2-1.5 1.5C5.5 7 4 5.5 4 4L5 3 4.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IcoLocation() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden><path d="M6.5 1A3.5 3.5 0 003 4.5C3 7.5 6.5 12 6.5 12S10 7.5 10 4.5A3.5 3.5 0 006.5 1z" stroke="currentColor" strokeWidth="1.2"/><circle cx="6.5" cy="4.5" r="1.2" fill="currentColor"/></svg> }
function IcoCalendar() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 1.5v2M9 1.5v2M1.5 5.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IcoClipboard(){ return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><rect x="2" y="2" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 2V3.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V2M5 7h4M5 9.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IcoEdit()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IcoInfo()     { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 5.5v4M6.5 4v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IcoUsers()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
