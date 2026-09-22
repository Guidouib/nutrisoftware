import { useState, useMemo, useEffect, useCallback } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { Cita, TipoCita, EstadoCita } from '../../types/cita'
import type { Paciente } from '../../types/paciente'
import { citasService } from '../../services/citasService'
import { pacientesService } from '../../services/pacientesService'

/* ── Constants ── */
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_SEMANA_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const tipoCitaOpts: { value: TipoCita; label: string }[] = [
  { value: 'primera_vez', label: 'Primera vez' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'control', label: 'Control' },
  { value: 'urgencia', label: 'Urgencia' },
]

const tipoCitaColor: Record<TipoCita, string> = {
  primera_vez: 'bg-blue-500',
  seguimiento: 'bg-primary-500',
  control:     'bg-purple-500',
  urgencia:    'bg-red-500',
}

const estadoBadge: Record<EstadoCita, 'success' | 'info' | 'neutral' | 'warning'> = {
  completada: 'success', programada: 'info', cancelada: 'neutral', no_asistio: 'warning',
}

const estadoLabel: Record<EstadoCita, string> = {
  completada: 'Completada', programada: 'Programada',
  cancelada: 'Cancelada', no_asistio: 'No asistió',
}

/* ── Zod schema ── */
const citaSchema = z.object({
  pacienteId:       z.string().min(1, 'Selecciona un paciente'),
  fecha:            z.string().min(1, 'Fecha requerida'),
  hora:             z.string().min(1, 'Hora requerida'),
  tipo:             z.enum(['primera_vez','seguimiento','control','urgencia']),
  modalidad:        z.enum(['presencial','virtual']),
  duracionMinutos:  z.coerce.number().min(15).max(180),
  notas:            z.string().optional(),
})
type CitaForm = z.infer<typeof citaSchema>

/* ── Helpers ── */
function getDaysInMonth(y: number, m: number): number { return new Date(y, m + 1, 0).getDate() }
function getFirstWeekday(y: number, m: number): number { return new Date(y, m, 1).getDay() }

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

type ViewMode = 'mes' | 'semana' | 'dia'

/* ═══════════════════════════════════════════════ */
export default function CitasPage() {
  const today = new Date()
  const [citas, setCitas]           = useState<Cita[]>([])
  const [pacientes, setPacientes]   = useState<Paciente[]>([])
  const [viewMode, setViewMode]     = useState<ViewMode>('mes')
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(today)
  const [modalOpen, setModalOpen]   = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CitaForm>({
    resolver: zodResolver(citaSchema) as unknown as Resolver<CitaForm>,
    defaultValues: { tipo: 'primera_vez', modalidad: 'presencial', duracionMinutos: 45 },
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const fetchCitas = useCallback(() => {
    citasService.getAll(month + 1, year).then(setCitas).catch(console.error)
  }, [year, month])

  useEffect(() => { fetchCitas() }, [fetchCitas])
  useEffect(() => { pacientesService.getAll(undefined, true).then(setPacientes).catch(console.error) }, [])

  /* ── Calendar grid days ── */
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstWeekday = getFirstWeekday(year, month)
    const days: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [year, month])

  /* ── Get citas for a day ── */
  const citasForDay = (date: Date | null): Cita[] => {
    if (!date) return []
    return citas.filter(c => isSameDay(new Date(c.fecha), date))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  }

  /* ── Week view days ── */
  const weekDays = useMemo((): Date[] => {
    const anchor = selectedDay ?? today
    const dow = anchor.getDay()
    const monday = new Date(anchor)
    monday.setDate(anchor.getDate() - dow + (dow === 0 ? -6 : 1))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }, [selectedDay])

  /* ── Upcoming ── */
  const upcoming = useMemo(() =>
    citas
      .filter(c => c.estado === 'programada' && new Date(c.fecha) > today)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 5),
    [citas])

  /* ── Navigate months ── */
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  /* ── Navigate weeks ── */
  const prevWeek = () => {
    const d = new Date(selectedDay ?? today)
    d.setDate(d.getDate() - 7)
    setSelectedDay(d)
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1))
  }
  const nextWeek = () => {
    const d = new Date(selectedDay ?? today)
    d.setDate(d.getDate() + 7)
    setSelectedDay(d)
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  /* ── Submit ── */
  const onSubmit = async (data: CitaForm) => {
    try {
      await citasService.create({
        pacienteId:      data.pacienteId,
        fechaHora:       `${data.fecha}T${data.hora}:00`,
        tipo:            data.tipo,
        modalidad:       data.modalidad,
        duracionMinutos: data.duracionMinutos,
        notas:           data.notas,
      })
      fetchCitas()
      setModalOpen(false)
      reset()
    } catch (err) {
      console.error(err)
    }
  }

  /* ── Day selector ── */
  const openDay = (date: Date) => {
    setSelectedDay(date)
    if (viewMode === 'mes') setViewMode('dia')
  }

  return (
    <div className="w-full animate-fade-up h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">Calendario de Citas</h1>
            {citas.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-canvas border border-border text-[11px] font-semibold text-text-tertiary">
                {citas.length}
              </span>
            )}
          </div>
          <p className="text-sm text-text-tertiary mt-0.5">Organiza y gestiona las consultas de tus pacientes</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
            {(['mes', 'semana', 'dia'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={[
                  'px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all',
                  viewMode === v ? 'bg-primary-500 text-white shadow-sm' : 'text-text-tertiary hover:text-text-primary',
                ].join(' ')}
              >
                {v === 'mes' ? 'Mes' : v === 'semana' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
          <Button onClick={() => { reset(); setModalOpen(true) }} leftIcon={<IcoPlus />}>
            Nueva cita
          </Button>
        </div>
      </div>

      <div className="flex gap-5" style={{ minHeight: '600px' }}>

        {/* ── Main calendar ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs h-full">

            {/* Calendar navigation */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <button
                onClick={viewMode === 'semana' ? prevWeek : prevMonth}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-canvas transition-all"
                aria-label="Anterior"
              >
                <IcoChevLeft />
              </button>
              <div className="text-center">
                {viewMode === 'semana' ? (
                  <p className="text-[14px] font-semibold text-text-primary">
                    {weekDays[0] && `${weekDays[0].getDate()} ${MESES[weekDays[0].getMonth()].slice(0,3)}`}
                    {' — '}
                    {weekDays[6] && `${weekDays[6].getDate()} ${MESES[weekDays[6].getMonth()].slice(0,3)} ${weekDays[6].getFullYear()}`}
                  </p>
                ) : viewMode === 'dia' && selectedDay ? (
                  <p className="text-[14px] font-semibold text-text-primary">
                    {DIAS_SEMANA_FULL[selectedDay.getDay()]}, {selectedDay.getDate()} de {MESES[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                  </p>
                ) : (
                  <p className="text-[14px] font-semibold text-text-primary">
                    {MESES[month]} {year}
                  </p>
                )}
              </div>
              <button
                onClick={viewMode === 'semana' ? nextWeek : nextMonth}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-canvas transition-all"
                aria-label="Siguiente"
              >
                <IcoChevRight />
              </button>
            </div>

            {/* ══ MONTH VIEW ══ */}
            {viewMode === 'mes' && (
              <div>
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {DIAS_SEMANA.map(d => (
                    <div key={d} className="py-2 text-center text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((date, i) => {
                    const dayCitas = citasForDay(date)
                    const isToday  = date ? isSameDay(date, today) : false
                    const isSel    = date && selectedDay ? isSameDay(date, selectedDay) : false
                    return (
                      <div
                        key={i}
                        onClick={() => date && openDay(date)}
                        className={[
                          'min-h-[90px] p-2 border-b border-r border-border/40 last:border-r-0 transition-colors',
                          date ? 'cursor-pointer hover:bg-canvas/70' : '',
                          isSel && date ? 'bg-primary-50/50' : '',
                        ].join(' ')}
                      >
                        {date && (
                          <>
                            <div className="flex items-center justify-end mb-1">
                              <span className={[
                                'w-6 h-6 rounded-full text-[12px] font-semibold flex items-center justify-center',
                                isToday ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-canvas',
                              ].join(' ')}>
                                {date.getDate()}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              {dayCitas.slice(0, 3).map(c => (
                                <button
                                  key={c.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedCita(c); setDetailOpen(true) }}
                                  className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate ${tipoCitaColor[c.tipo]}`}
                                >
                                  {fmtTime(c.fecha)} {c.pacienteNombre.split(' ')[0]}
                                </button>
                              ))}
                              {dayCitas.length > 3 && (
                                <p className="text-[10px] text-text-tertiary pl-1">+{dayCitas.length - 3} más</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══ WEEK VIEW ══ */}
            {viewMode === 'semana' && (
              <div>
                {/* Column headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {weekDays.map((date, i) => {
                    const isToday = isSameDay(date, today)
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedDay(date)}
                        className="py-2.5 px-2 text-center cursor-pointer hover:bg-canvas/60 transition-colors"
                      >
                        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                          {DIAS_SEMANA[date.getDay()]}
                        </p>
                        <p className={[
                          'text-[18px] font-bold mt-0.5 w-9 h-9 rounded-full flex items-center justify-center mx-auto',
                          isToday ? 'bg-primary-500 text-white' : 'text-text-primary',
                        ].join(' ')}>
                          {date.getDate()}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Appointments */}
                <div className="grid grid-cols-7 divide-x divide-border" style={{ minHeight: '420px' }}>
                  {weekDays.map((date, i) => {
                    const dayCitas = citasForDay(date)
                    return (
                      <div key={i} className="p-2 space-y-1.5">
                        {dayCitas.length === 0 ? (
                          <button
                            onClick={() => { setSelectedDay(date); reset(); setModalOpen(true) }}
                            className="w-full h-10 rounded-lg border border-dashed border-border text-[11px] text-text-disabled hover:border-primary-300 hover:text-primary-500 transition-all"
                          >
                            +
                          </button>
                        ) : dayCitas.map(c => (
                          <button
                            key={c.id}
                            onClick={() => { setSelectedCita(c); setDetailOpen(true) }}
                            className={`w-full text-left p-2 rounded-xl text-white text-[11px] shadow-sm ${tipoCitaColor[c.tipo]}`}
                          >
                            <p className="font-semibold truncate">{c.pacienteNombre.split(' ')[0]} {c.pacienteNombre.split(' ')[1]}</p>
                            <p className="opacity-80 mt-0.5">{fmtTime(c.fecha)} · {c.duracionMinutos}min</p>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══ DAY VIEW ══ */}
            {viewMode === 'dia' && selectedDay && (
              <div className="p-5">
                {/* Day nav */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() - 1); setSelectedDay(d) }}
                    className="p-1.5 rounded-lg text-text-tertiary hover:bg-canvas"
                  >
                    <IcoChevLeft />
                  </button>
                  <button
                    onClick={() => setSelectedDay(today)}
                    className="px-3 py-1 rounded-lg text-[12px] font-medium bg-canvas border border-border text-text-secondary hover:border-primary-300 transition-all"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() + 1); setSelectedDay(d) }}
                    className="p-1.5 rounded-lg text-text-tertiary hover:bg-canvas"
                  >
                    <IcoChevRight />
                  </button>
                </div>

                {(() => {
                  const dayCitas = citasForDay(selectedDay)
                  if (dayCitas.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 bg-canvas rounded-2xl flex items-center justify-center mb-3">
                          <IcoCalendar />
                        </div>
                        <p className="font-semibold text-text-primary">Sin citas este día</p>
                        <p className="text-sm text-text-tertiary mt-1">No hay consultas programadas para el {selectedDay.getDate()} de {MESES[selectedDay.getMonth()]}</p>
                        <Button className="mt-4" size="sm" onClick={() => { reset(); setModalOpen(true) }} leftIcon={<IcoPlus />}>
                          Agendar cita
                        </Button>
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-3">
                      {dayCitas.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCita(c); setDetailOpen(true) }}
                          className="w-full text-left bg-canvas border border-border rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all flex items-center gap-4"
                        >
                          <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${tipoCitaColor[c.tipo]}`} aria-hidden />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-text-primary text-[13px]">{c.pacienteNombre}</p>
                              <Badge variant={estadoBadge[c.estado]}>{estadoLabel[c.estado]}</Badge>
                              <Badge variant={c.modalidad === 'virtual' ? 'info' : 'neutral'}>
                                {c.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                              </Badge>
                            </div>
                            <p className="text-[12px] text-text-tertiary mt-1">
                              {fmtTime(c.fecha)} · {c.duracionMinutos} min · {tipoCitaLabel(c.tipo)}
                            </p>
                            {c.notas && <p className="text-[12px] text-text-secondary mt-1 italic">{c.notas}</p>}
                          </div>
                          <Avatar name={c.pacienteNombre} size="sm" className="flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar: mini-calendar + upcoming ── */}
        <aside className="w-[260px] flex-shrink-0 space-y-4">

          {/* Mini calendar */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded-lg text-text-tertiary hover:bg-canvas"><IcoChevLeft /></button>
              <p className="text-[12px] font-semibold text-text-primary">{MESES[month].slice(0,3)} {year}</p>
              <button onClick={nextMonth} className="p-1 rounded-lg text-text-tertiary hover:bg-canvas"><IcoChevRight /></button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-[9px] font-semibold text-text-disabled py-1">{d[0]}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((date, i) => {
                const hasCitas = date ? citasForDay(date).length > 0 : false
                const isToday  = date ? isSameDay(date, today) : false
                const isSel    = date && selectedDay ? isSameDay(date, selectedDay) : false
                return (
                  <button
                    key={i}
                    onClick={() => date && setSelectedDay(date)}
                    disabled={!date}
                    className={[
                      'h-7 w-7 rounded-full text-[11px] font-medium mx-auto flex items-center justify-center relative transition-all',
                      !date ? 'opacity-0 pointer-events-none' : '',
                      isToday ? 'bg-primary-500 text-white' :
                      isSel ? 'bg-primary-100 text-primary-700 font-bold' :
                      'text-text-secondary hover:bg-canvas',
                    ].join(' ')}
                  >
                    {date?.getDate()}
                    {hasCitas && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full" aria-hidden />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
            <h3 className="text-[12px] font-bold text-text-primary uppercase tracking-wide mb-3">Próximas citas</h3>
            {upcoming.length === 0 ? (
              <p className="text-[12px] text-text-tertiary text-center py-3">Sin citas próximas</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCita(c); setDetailOpen(true) }}
                    className="w-full text-left flex gap-3 p-2.5 rounded-xl hover:bg-canvas border border-transparent hover:border-border transition-all group"
                  >
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${tipoCitaColor[c.tipo]}`} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-text-primary truncate group-hover:text-primary-600 transition-colors">
                        {c.pacienteNombre.split(' ').slice(0, 2).join(' ')}
                      </p>
                      <p className="text-[10px] text-text-tertiary mt-0.5">{tipoCitaLabel(c.tipo)}</p>
                      <p className="text-[10px] text-text-disabled mt-0.5">
                        {new Date(c.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} · {fmtTime(c.fecha)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
            <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2.5">Tipo de consulta</h3>
            <div className="space-y-1.5">
              {tipoCitaOpts.map(t => (
                <div key={t.value} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${tipoCitaColor[t.value]}`} aria-hidden />
                  <span className="text-[12px] text-text-secondary">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════
          MODAL Nueva Cita
      ══════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva cita"
        description="Registra una consulta para tu paciente"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button form="cita-form" type="submit">Guardar cita</Button>
          </>
        }
      >
        <form id="cita-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Paciente selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-secondary">Paciente *</label>
              <select
                {...register('pacienteId')}
                className="h-10 px-3 text-[13px] bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Seleccionar paciente...</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
              {errors.pacienteId && <p className="text-[11px] text-error">{errors.pacienteId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha *"
                type="date"
                error={errors.fecha?.message}
                {...register('fecha')}
              />
              <Input
                label="Hora *"
                type="time"
                error={errors.hora?.message}
                {...register('hora')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-secondary">Tipo</label>
                <select
                  {...register('tipo')}
                  className="h-10 px-3 text-[13px] bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {tipoCitaOpts.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-secondary">Modalidad</label>
                <select
                  {...register('modalidad')}
                  className="h-10 px-3 text-[13px] bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
            </div>

            <Input
              label="Duración (minutos)"
              type="number"
              {...register('duracionMinutos')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-secondary">Notas</label>
              <textarea
                {...register('notas')}
                placeholder="Observaciones, motivo de consulta..."
                rows={3}
                className="px-3 py-2 text-[13px] bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ══════════════════════════════════════
          MODAL Detalle Cita
      ══════════════════════════════════════ */}
      {selectedCita && (
        <Modal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          title="Detalle de cita"
          size="sm"
          footer={
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cerrar</Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selectedCita.pacienteNombre} size="md" />
              <div>
                <p className="font-semibold text-text-primary">{selectedCita.pacienteNombre}</p>
                <Badge variant={estadoBadge[selectedCita.estado]}>{estadoLabel[selectedCita.estado]}</Badge>
              </div>
            </div>
            <div className="space-y-2 text-[13px]">
              {[
                { label: 'Fecha y hora', value: `${new Date(selectedCita.fecha).toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} a las ${fmtTime(selectedCita.fecha)}` },
                { label: 'Tipo', value: tipoCitaLabel(selectedCita.tipo) },
                { label: 'Modalidad', value: selectedCita.modalidad === 'virtual' ? 'Virtual' : 'Presencial' },
                { label: 'Duración', value: `${selectedCita.duracionMinutos} minutos` },
              ].map(d => (
                <div key={d.label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-tertiary">{d.label}</span>
                  <span className="font-medium text-text-primary">{d.value}</span>
                </div>
              ))}
              {selectedCita.notas && (
                <div className="p-3 bg-canvas rounded-xl">
                  <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1">Notas</p>
                  <p className="text-text-secondary text-[12px]">{selectedCita.notas}</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Inline label helpers ── */
function tipoCitaLabel(tipo: TipoCita): string {
  const map: Record<TipoCita, string> = {
    primera_vez: 'Primera vez', seguimiento: 'Seguimiento',
    control: 'Control', urgencia: 'Urgencia',
  }
  return map[tipo] ?? tipo
}

/* ── Inline icons ── */
function IcoPlus()      { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function IcoChevLeft()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IcoChevRight() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M5.5 3L9.5 7l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IcoCalendar()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 1.5v2M9 1.5v2M1.5 5.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
