import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { Paciente, CrearPacienteDto } from '../../types/paciente'
import { pacientesService } from '../../services/pacientesService'

/* ── Zod schema ── */
const pacienteSchema = z.object({
  nombre:          z.string().min(2, 'Mínimo 2 caracteres'),
  apellido:        z.string().min(2, 'Mínimo 2 caracteres'),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  sexo:            z.enum(['M', 'F'], { message: 'Selecciona sexo' }),
  email:           z.string().email('Email inválido').optional().or(z.literal('')),
  telefono:        z.string().optional(),
  dni:             z.string().optional(),
  direccion:       z.string().optional(),
  notas:           z.string().optional(),
})
type PacienteForm = z.infer<typeof pacienteSchema>

/* ── Helpers ── */
function calcAge(fechaNacimiento: string): number {
  const birth = new Date(fechaNacimiento)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
  return age
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

type FilterEstado = 'todos' | 'activo' | 'inactivo'

/* ═══════════════════════════════════════════════ */
export default function PacientesPage() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filtroEstado, setFiltro]   = useState<FilterEstado>('todos')
  const [viewMode, setViewMode]     = useState<'tabla' | 'cards'>('tabla')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<Paciente | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
  })

  useEffect(() => {
    pacientesService.getAll().then(setPacientes).catch(console.error).finally(() => setLoading(false))
  }, [])

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return pacientes.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q
        || `${p.nombre} ${p.apellido}`.toLowerCase().includes(q)
        || (p.dni ?? '').includes(q)
        || (p.email ?? '').toLowerCase().includes(q)
      const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
      return matchSearch && matchEstado
    })
  }, [pacientes, search, filtroEstado])

  /* ── Stats ── */
  const totalActivos = pacientes.filter(p => p.estado === 'activo').length
  const totalInactivos = pacientes.filter(p => p.estado === 'inactivo').length
  const nuevos = pacientes.filter(p => {
    const d = new Date(p.fechaCreacion)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  /* ── Open modal to create ── */
  const openCreate = () => {
    setEditTarget(null)
    reset()
    setModalOpen(true)
  }

  /* ── Open modal to edit ── */
  const openEdit = (p: Paciente, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTarget(p)
    setValue('nombre', p.nombre)
    setValue('apellido', p.apellido)
    setValue('fechaNacimiento', p.fechaNacimiento)
    setValue('sexo', p.sexo)
    setValue('email', p.email ?? '')
    setValue('telefono', p.telefono ?? '')
    setValue('dni', p.dni ?? '')
    setValue('direccion', p.direccion ?? '')
    setValue('notas', p.notas ?? '')
    setModalOpen(true)
  }

  /* ── Submit form ── */
  const onSubmit = async (data: PacienteForm) => {
    try {
      if (editTarget) {
        const updated = await pacientesService.update(editTarget.id, data as CrearPacienteDto)
        setPacientes(prev => prev.map(p => p.id === editTarget.id ? updated : p))
      } else {
        const nuevo = await pacientesService.create(data as CrearPacienteDto)
        setPacientes(prev => [nuevo, ...prev])
      }
      setModalOpen(false)
      reset()
    } catch (err) {
      console.error(err)
    }
  }

  /* ── Toggle estado ── */
  const toggleEstado = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const updated = await pacientesService.toggleEstado(id)
      setPacientes(prev => prev.map(p => p.id === id ? updated : p))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="w-full animate-fade-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">Pacientes</h1>
            {!loading && pacientes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-canvas border border-border text-[11px] font-semibold text-text-tertiary">
                {pacientes.length}
              </span>
            )}
          </div>
          <p className="text-sm text-text-tertiary mt-0.5">Gestiona el historial clínico de todos tus pacientes</p>
        </div>
        <Button onClick={openCreate} size="md" leftIcon={<IcoPlus />}>
          Nuevo paciente
        </Button>
      </div>

      {/* ── Command bar ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-xs mb-5 overflow-hidden">
        {/* Search row */}
        <div className="relative border-b border-border">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" aria-hidden>
            <IcoSearch />
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre, DNI o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 text-[14px] bg-transparent text-text-primary placeholder:text-text-disabled focus:outline-none"
          />
        </div>
        {/* Filter tabs + view toggle */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-0.5">
            {([
              { key: 'todos' as FilterEstado, label: 'Todos', count: pacientes.length },
              { key: 'activo' as FilterEstado, label: 'Activos', count: totalActivos },
              { key: 'inactivo' as FilterEstado, label: 'Inactivos', count: totalInactivos },
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
                  filtroEstado === f.key
                    ? 'bg-primary-500 text-white'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-canvas',
                ].join(' ')}
              >
                {f.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filtroEstado === f.key ? 'bg-white/20 text-white' : 'bg-canvas text-text-disabled'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setViewMode('tabla')} aria-label="Vista tabla"
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'tabla' ? 'bg-primary-500 text-white' : 'text-text-tertiary hover:text-text-primary hover:bg-canvas'}`}>
              <IcoList />
            </button>
            <button onClick={() => setViewMode('cards')} aria-label="Vista tarjetas"
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-primary-500 text-white' : 'text-text-tertiary hover:text-text-primary hover:bg-canvas'}`}>
              <IcoGrid />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-canvas rounded-2xl flex items-center justify-center mx-auto mb-3">
            <IcoUsers />
          </div>
          <p className="text-text-primary font-semibold">No hay pacientes</p>
          <p className="text-sm text-text-tertiary mt-1">
            {search ? `Sin resultados para "${search}"` : 'Registra tu primer paciente'}
          </p>
          {!search && (
            <Button onClick={openCreate} size="sm" className="mt-4" leftIcon={<IcoPlus />}>
              Nuevo paciente
            </Button>
          )}
        </div>
      ) : viewMode === 'tabla' ? (
        /* ── Table view ── */
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/60">
                  {['Paciente', 'DNI', 'Edad / Sexo', 'Última cita', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                    className="border-b border-border/50 last:border-0 hover:bg-canvas/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${p.nombre} ${p.apellido}`} size="sm" />
                        <div>
                          <p className="font-semibold text-text-primary text-[13px] group-hover:text-primary-600 transition-colors">
                            {p.nombre} {p.apellido}
                          </p>
                          {p.email && <p className="text-[11px] text-text-tertiary">{p.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-text-secondary">{p.dni ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-text-secondary">
                      {calcAge(p.fechaNacimiento)} años · {p.sexo === 'F' ? 'Femenino' : 'Masculino'}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-text-secondary">
                      {p.ultimaCita ? fmtDate(p.ultimaCita) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => toggleEstado(p.id, e)}
                        aria-label={`Estado: ${p.estado}`}
                      >
                        <Badge variant={p.estado === 'activo' ? 'success' : 'neutral'}>
                          {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => openEdit(p, e)}
                          aria-label="Editar paciente"
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-primary-600 hover:bg-primary-50 transition-all"
                        >
                          <IcoEdit />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/pacientes/${p.id}`) }}
                          aria-label="Ver detalle"
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-primary-600 hover:bg-primary-50 transition-all"
                        >
                          <IcoArrow />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border bg-canvas/40">
            <p className="text-[11px] text-text-tertiary">
              {filtered.length} de {pacientes.length} pacientes
            </p>
          </div>
        </div>
      ) : (
        /* ── Cards view ── */
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/pacientes/${p.id}`)}
              className="bg-surface border border-border rounded-2xl p-4 shadow-xs card-hover cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <Avatar name={`${p.nombre} ${p.apellido}`} size="md" />
                <Badge variant={p.estado === 'activo' ? 'success' : 'neutral'}>
                  {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="font-semibold text-text-primary text-[13px] leading-tight group-hover:text-primary-600 transition-colors">
                {p.nombre} {p.apellido}
              </p>
              <p className="text-[12px] text-text-tertiary mt-0.5">
                {calcAge(p.fechaNacimiento)} años · {p.sexo === 'F' ? 'Femenino' : 'Masculino'}
              </p>
              {p.telefono && (
                <p className="text-[11px] text-text-disabled mt-2">{p.telefono}</p>
              )}
              {p.ultimaCita && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-text-disabled uppercase tracking-wide font-semibold">Última cita</p>
                  <p className="text-[12px] text-text-secondary mt-0.5">{fmtDate(p.ultimaCita)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL Crear / Editar Paciente
      ══════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar paciente' : 'Nuevo paciente'}
        description={editTarget ? `Actualizando datos de ${editTarget.nombre} ${editTarget.apellido}` : 'Completa los datos del paciente'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button form="paciente-form" type="submit">
              {editTarget ? 'Guardar cambios' : 'Crear paciente'}
            </Button>
          </>
        }
      >
        <form id="paciente-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              placeholder="María"
              error={errors.nombre?.message}
              {...register('nombre')}
            />
            <Input
              label="Apellido *"
              placeholder="García Torres"
              error={errors.apellido?.message}
              {...register('apellido')}
            />
            <Input
              label="Fecha de nacimiento *"
              type="date"
              error={errors.fechaNacimiento?.message}
              {...register('fechaNacimiento')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-secondary">Sexo *</label>
              <select
                {...register('sexo')}
                className="h-10 px-3 text-[13px] bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              >
                <option value="">Seleccionar...</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
              {errors.sexo && <p className="text-[11px] text-error">{errors.sexo.message}</p>}
            </div>
            <Input
              label="DNI"
              placeholder="70234567"
              {...register('dni')}
            />
            <Input
              label="Teléfono"
              placeholder="987654321"
              {...register('telefono')}
            />
            <div className="col-span-2">
              <Input
                label="Email"
                type="email"
                placeholder="paciente@gmail.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Dirección"
                placeholder="Av. Javier Prado 1240, San Isidro, Lima"
                {...register('direccion')}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-secondary">Notas clínicas</label>
              <textarea
                {...register('notas')}
                placeholder="Observaciones, diagnósticos previos, alergias..."
                rows={3}
                className="px-3 py-2 text-[13px] bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ── Inline icons ── */
function IcoPlus() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function IcoUsers() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 7c1.4 0 2.5 1 2.5 2.5 0 1.1-.5 1.8-1.5 2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IcoCheck() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IcoStar() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.4 4.4 12.5l.7-4L2.2 5.7l4-.6L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> }
function IcoSearch() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IcoList() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M2 3.5h10M2 7h10M2 10.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IcoGrid() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg> }
function IcoEdit() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IcoArrow() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
