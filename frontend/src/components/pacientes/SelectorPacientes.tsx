import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { edadEnAnios } from '../../lib/antropometria'
import { pacientesService } from '../../services/pacientesService'
import type { Paciente } from '../../types/paciente'

interface SelectorPacientesProps {
  titulo: string
  descripcion: string
  /** Ruta a la que navegar tras elegir un paciente. */
  destino: (pacienteId: string) => string
}

/**
 * Entrada de los módulos que trabajan sobre un paciente (Evaluaciones, Dietas,
 * Seguimiento y Reportes): el ítem del sidebar no lleva `pacienteId`, así que
 * primero se elige el paciente y desde ahí se entra al módulo.
 */
export function SelectorPacientes({ titulo, descripcion, destino }: SelectorPacientesProps) {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    pacientesService
      .getAll()
      .then(setPacientes)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return pacientes
    return pacientes.filter(p => `${p.nombre} ${p.apellido}`.toLowerCase().includes(q))
  }, [pacientes, busqueda])

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <header className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{titulo}</h1>
        <p className="text-xs text-slate-500 md:text-sm">{descripcion}</p>
      </header>

      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <input
          type="search"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar paciente por nombre…"
          aria-label="Buscar paciente"
          className="h-11 w-full rounded-xl border border-border bg-white px-4 text-[14px] text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />

        {cargando ? (
          <p className="mt-4 text-xs text-slate-500">Cargando pacientes…</p>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-10">
            <p className="text-lg font-bold text-slate-800">
              {pacientes.length === 0 ? 'Sin pacientes' : 'Sin coincidencias'}
            </p>
            <p className="text-xs text-slate-500">
              {pacientes.length === 0
                ? 'Registra un paciente en el módulo de Pacientes para poder continuar.'
                : `Ningún paciente coincide con "${busqueda}".`}
            </p>
            {pacientes.length === 0 && (
              <Link
                to="/pacientes"
                className="mt-3 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
              >
                Ir a Pacientes
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-4 grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => navigate(destino(p.id))}
                  className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-border bg-white p-4 text-left transition-colors hover:border-primary-200 hover:bg-canvas"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                    {`${p.nombre[0] ?? ''}${p.apellido[0] ?? ''}`.toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-slate-800">
                      {p.nombre} {p.apellido}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {edadEnAnios(p.fechaNacimiento)} años · {p.sexo === 'M' ? 'Masculino' : 'Femenino'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
