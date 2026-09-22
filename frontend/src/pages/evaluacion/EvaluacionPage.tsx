import { Link, useParams } from 'react-router-dom'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { SelectorPacientes } from '../../components/pacientes/SelectorPacientes'
import { edadEnAnios } from '../../lib/antropometria'
import { usePaciente } from '../../hooks/useEvaluacion'
import { TIPOS_EVALUACION, type TipoEvaluacion } from '../../types/evaluacion'
import type { Paciente } from '../../types/paciente'

/** Tipo sugerido a partir de la edad; embarazada siempre se elige a mano. */
function tipoSugerido(paciente: Paciente | undefined): TipoEvaluacion | null {
  if (!paciente) return null
  const edad = edadEnAnios(paciente.fechaNacimiento)
  if (edad < 12) return 'nino'
  if (edad < 18) return 'adolescente'
  return 'adulto'
}

const RUTA_TIPO: Record<TipoEvaluacion, string> = {
  nino: 'nino',
  adolescente: 'adolescente',
  embarazada: 'embarazada',
  adulto: 'adulto',
}

const MODULOS_TRANSVERSALES = [
  {
    ruta: 'antropometria',
    titulo: 'Antropometría ISAK',
    descripcion: 'Niveles 1 a 4, % de grasa, somatotipo y somatocarta.',
  },
  {
    ruta: 'bioquimica',
    titulo: 'Bioquímica nutricional',
    descripcion: 'Interpretación automática de laboratorio con semáforo.',
  },
  {
    ruta: 'clinica',
    titulo: 'Evaluación clínica',
    descripcion: 'Signos por sistemas y deficiencias sugeridas.',
  },
]

export default function EvaluacionPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()
  const { data: paciente, isLoading } = usePaciente(pacienteId)

  if (!pacienteId) {
    return (
      <SelectorPacientes
        titulo="Evaluaciones"
        descripcion="Elige al paciente para abrir su hoja de evaluación nutricional"
        destino={id => `/evaluacion/${id}`}
      />
    )
  }

  const sugerido = tipoSugerido(paciente)
  const edad = paciente ? edadEnAnios(paciente.fechaNacimiento) : 0

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/evaluaciones" className="text-xs font-medium text-primary-600 hover:text-primary-700">
            ← Todos los pacientes
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Evaluación nutricional
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {isLoading
              ? 'Cargando paciente…'
              : paciente
                ? `${paciente.nombre} ${paciente.apellido} · ${edad} años · ${paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}`
                : 'Paciente no encontrado'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/seguimiento/${pacienteId}`}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas"
          >
            Seguimiento
          </Link>
          <Link
            to={`/dietas/${pacienteId}/nueva`}
            className="rounded-xl bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
          >
            Crear dieta
          </Link>
        </div>
      </header>

      {/* ── Tipo de evaluación ── */}
      <section className="w-full min-w-0">
        <h2 className="text-base font-bold text-slate-800">Tipo de evaluación</h2>
        <p className="text-xs text-slate-500">
          {sugerido
            ? 'La sugerencia se calcula a partir de la fecha de nacimiento; puedes elegir otra.'
            : 'Elige el tipo de evaluación a realizar.'}
        </p>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPOS_EVALUACION.map(tipo => {
            const esSugerido = tipo.valor === sugerido
            const noAplica = tipo.valor === 'embarazada' && paciente?.sexo === 'M'

            return (
              <Link
                key={tipo.valor}
                to={`/evaluacion/${pacienteId}/${RUTA_TIPO[tipo.valor]}`}
                aria-disabled={noAplica}
                className={[
                  'flex min-w-0 flex-col gap-2 rounded-2xl border bg-white p-6 shadow-sm transition-all',
                  noAplica
                    ? 'pointer-events-none opacity-45'
                    : esSugerido
                      ? 'border-primary-300 ring-1 ring-primary-200 hover:shadow-md'
                      : 'border-slate-100 hover:border-primary-200 hover:shadow-md',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base font-bold text-slate-800">{tipo.titulo}</span>
                  {esSugerido && <SemaforoBadge size="sm" nivel="optimo">Sugerida</SemaforoBadge>}
                </div>
                <span className="text-xs font-medium text-primary-600">{tipo.rango}</span>
                <span className="text-xs leading-relaxed text-slate-500">{tipo.descripcion}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Módulos transversales ── */}
      <section className="w-full min-w-0">
        <h2 className="text-base font-bold text-slate-800">Módulos complementarios</h2>
        <p className="text-xs text-slate-500">Aplican a cualquier tipo de paciente</p>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
          {MODULOS_TRANSVERSALES.map(m => (
            <Link
              key={m.ruta}
              to={`/evaluacion/${pacienteId}/${m.ruta}`}
              className="flex min-w-0 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
            >
              <span className="text-base font-bold text-slate-800">{m.titulo}</span>
              <span className="text-xs leading-relaxed text-slate-500">{m.descripcion}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
