import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { SelectorPacientes } from '../../components/pacientes/SelectorPacientes'
import { usePaciente } from '../../hooks/useEvaluacion'
import { useEliminarRegistro, useRegistrosDePaciente } from '../../hooks/useConsumo'
import { consumoService } from '../../services/consumoService'

function nuevoId(): string {
  return crypto.randomUUID()
}

function fechaLegible(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Entrada del módulo de consumo. Sin paciente en la ruta muestra el selector,
 * igual que Evaluaciones, Dietas y Seguimiento.
 */
export default function ConsumoPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>()

  if (!pacienteId) {
    return (
      <SelectorPacientes
        titulo="Consumo"
        descripcion="Elige al paciente para registrar o revisar lo que declaró haber comido"
        destino={id => `/consumo/${id}`}
      />
    )
  }

  return <ListaRecordatorios pacienteId={pacienteId} />
}

function ListaRecordatorios({ pacienteId }: { pacienteId: string }) {
  const navigate = useNavigate()
  const { data: paciente } = usePaciente(pacienteId)
  const { data: registros = [], isLoading } = useRegistrosDePaciente(pacienteId)
  const eliminar = useEliminarRegistro(pacienteId)
  const [exportando, setExportando] = useState(false)

  const onExportar = async () => {
    setExportando(true)
    try {
      const nombre = paciente
        ? `consumo-${paciente.nombre}-${paciente.apellido}.csv`.replace(/\s+/g, '-').toLowerCase()
        : `consumo-${pacienteId}.csv`
      await consumoService.exportarCsv(pacienteId, nombre)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/consumo"
            className="text-[12px] font-semibold text-primary-600 hover:underline"
          >
            ← Cambiar de paciente
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
            Consumo declarado
          </h1>
          <p className="text-[13px] text-text-secondary">
            {paciente
              ? `${paciente.nombre} ${paciente.apellido}`
              : 'Recordatorios cuantificados contra la tabla de composición'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onExportar}
            loading={exportando}
            disabled={registros.length === 0}
          >
            Exportar CSV
          </Button>
          <Button onClick={() => navigate(`/consumo/${pacienteId}/${nuevoId()}`)}>
            Nuevo recordatorio
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : registros.length === 0 ? (
        <Card>
          <CardBody className="py-14 text-center">
            <p className="text-[15px] font-semibold text-text-primary">
              Todavía no hay recordatorios
            </p>
            <p className="mx-auto mt-1 max-w-md text-[13px] text-text-secondary">
              Registrá lo que el paciente declaró haber comido y el sistema calcula el
              aporte de 22 nutrientes contra la tabla peruana de composición.
            </p>
            <Button
              className="mt-5"
              onClick={() => navigate(`/consumo/${pacienteId}/${nuevoId()}`)}
            >
              Crear el primero
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {registros.map(r => (
            <Card key={r.id} variant="default" className="transition-shadow hover:shadow-md">
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-text-primary">{r.titulo}</p>
                    <p className="text-[12px] text-text-tertiary">{fechaLegible(r.fecha)}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-canvas px-2 py-1 text-[11px] font-semibold text-text-secondary">
                    {r.cantidadItems} {r.cantidadItems === 1 ? 'alimento' : 'alimentos'}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-canvas px-3 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                      Energía
                    </dt>
                    <dd className="text-[15px] font-bold text-text-primary">
                      {r.energiaKcal.toFixed(0)}{' '}
                      <span className="text-[11px] font-medium text-text-tertiary">kcal</span>
                    </dd>
                  </div>
                  <div className="rounded-xl bg-canvas px-3 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                      Proteínas
                    </dt>
                    <dd className="text-[15px] font-bold text-text-primary">
                      {r.proteinasG.toFixed(1)}{' '}
                      <span className="text-[11px] font-medium text-text-tertiary">g</span>
                    </dd>
                  </div>
                </dl>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate(`/consumo/${pacienteId}/${r.id}`)}
                  >
                    Abrir
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar «${r.titulo}»? No se puede deshacer.`)) {
                        eliminar.mutate(r.id)
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
