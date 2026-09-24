import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { BuscadorAlimentosDrawer } from '../../components/dietas/BuscadorAlimentosDrawer'
import { TablaNutrientes } from '../../components/consumo/TablaNutrientes'
import { usePaciente } from '../../hooks/useEvaluacion'
import { useRecordatorio, type EstadoAutoguardado } from '../../hooks/useConsumo'
import { calcularAporte, calcularTotales } from '../../lib/consumo'
import { origenPorCategoria, type OrigenAlimento } from '../../lib/nutrientes'
import { TIEMPOS_COMIDA, type ItemConsumo } from '../../types/consumo'
import type { Alimento } from '../../types/alimento'

const ORIGENES: OrigenAlimento[] = ['Animal', 'Vegetal', 'Mixto']

const LEYENDA_GUARDADO: Record<EstadoAutoguardado, string> = {
  inactivo: '',
  pendiente: 'Cambios sin guardar…',
  guardando: 'Guardando…',
  guardado: 'Guardado',
  error: 'No se pudo guardar',
}

export default function RecordatorioPage() {
  const { pacienteId, registroId } = useParams<{ pacienteId: string; registroId: string }>()
  const { data: paciente } = usePaciente(pacienteId)

  // El id ya viene en la ruta aunque el recordatorio todavía no exista: el
  // primer autoguardado lo crea (el PUT es idempotente).
  const { borrador, actualizar, cargando, estadoGuardado, guardarAhora, errorGuardado } =
    useRecordatorio(pacienteId, registroId!)

  const [buscadorAbierto, setBuscadorAbierto] = useState(false)
  const [tiempoDestino, setTiempoDestino] = useState<string>(TIEMPOS_COMIDA[0])

  const totales = useMemo(() => calcularTotales(borrador.items), [borrador.items])

  const porTiempo = useMemo(() => {
    const mapa = new Map<string, ItemConsumo[]>()
    for (const item of borrador.items) {
      const lista = mapa.get(item.tiempoComida) ?? []
      lista.push(item)
      mapa.set(item.tiempoComida, lista)
    }
    return mapa
  }, [borrador.items])

  const agregarAlimento = (alimento: Alimento, gramos: number) => {
    const composicion = alimento.micronutrientes ?? {
      // Alimento sin composición completa (los personalizados, por ejemplo):
      // se arma con los macronutrientes que sí tiene. El resto queda ausente,
      // o sea "sin dato", no cero.
      energiaKcal: alimento.energia,
      proteinas: alimento.proteinas,
      grasaTotal: alimento.grasas,
      carbohidratosTot: alimento.carbohidratos,
      fibra: alimento.fibra,
      ...(alimento.sodio !== undefined ? { sodio: alimento.sodio } : {}),
      ...(alimento.calcio !== undefined ? { calcio: alimento.calcio } : {}),
      ...(alimento.hierro !== undefined ? { hierro: alimento.hierro } : {}),
    }

    const nuevo: ItemConsumo = {
      id: crypto.randomUUID(),
      tiempoComida: tiempoDestino,
      orden: borrador.items.length,
      alimentoId: alimento.id,
      nombreAlimento: alimento.nombre,
      gramos,
      origenAlimento: origenPorCategoria(alimento.categoria),
      composicion,
      aporte: calcularAporte(composicion, gramos),
    }

    actualizar(b => ({ ...b, items: [...b.items, nuevo] }))
    setBuscadorAbierto(false)
  }

  /** Recalcula el aporte al tocar los gramos: el total se mueve al instante. */
  const cambiarGramos = (itemId: string, gramos: number) =>
    actualizar(b => ({
      ...b,
      items: b.items.map(i =>
        i.id === itemId ? { ...i, gramos, aporte: calcularAporte(i.composicion, gramos) } : i
      ),
    }))

  const cambiarOrigen = (itemId: string, origen: OrigenAlimento) =>
    actualizar(b => ({
      ...b,
      items: b.items.map(i => (i.id === itemId ? { ...i, origenAlimento: origen } : i)),
    }))

  /**
   * Quita un alimento por id.
   *
   * El Excel borraba por índice y pegaba el resto de la lista sobre la fila 3
   * en vez de sobre la que quedó libre, así que borrar cualquier alimento que
   * no fuera el primero destruía los anteriores. Filtrar por id no tiene ese
   * problema: no hay posiciones que recalcular.
   */
  const quitarItem = (itemId: string) =>
    actualizar(b => ({ ...b, items: b.items.filter(i => i.id !== itemId) }))

  if (cargando) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/consumo/${pacienteId}`}
            className="text-[12px] font-semibold text-primary-600 hover:underline"
          >
            ← Volver a los recordatorios
          </Link>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-text-primary">
            {borrador.titulo || 'Recordatorio'}
          </h1>
          <p className="text-[13px] text-text-secondary">
            {paciente ? `${paciente.nombre} ${paciente.apellido}` : '—'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={[
              'text-[12px] font-medium',
              estadoGuardado === 'error' ? 'text-error' : 'text-text-tertiary',
            ].join(' ')}
          >
            {LEYENDA_GUARDADO[estadoGuardado]}
          </span>
          <Button variant="secondary" onClick={guardarAhora}>
            Guardar ahora
          </Button>
        </div>
      </header>

      {errorGuardado && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3">
          <p className="text-[13px] text-error">{errorGuardado}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ── Carga ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Título"
                value={borrador.titulo}
                onChange={e => actualizar(b => ({ ...b, titulo: e.target.value }))}
                placeholder="Recordatorio 24 h"
              />
              <Input
                label="Fecha declarada"
                type="date"
                value={borrador.fecha}
                onChange={e => actualizar(b => ({ ...b, fecha: e.target.value }))}
                hint="El día que el paciente describe, no el de la carga"
              />
            </CardBody>
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-text-tertiary">Agregar a:</span>
            {TIEMPOS_COMIDA.map(t => (
              <button
                key={t}
                onClick={() => setTiempoDestino(t)}
                className={[
                  'rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  tiempoDestino === t
                    ? 'bg-primary-500 text-white'
                    : 'bg-canvas text-text-secondary hover:bg-border',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
            <Button size="sm" className="ml-auto" onClick={() => setBuscadorAbierto(true)}>
              Buscar alimento
            </Button>
          </div>

          {borrador.items.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <p className="text-[14px] font-semibold text-text-primary">
                  Sin alimentos todavía
                </p>
                <p className="mx-auto mt-1 max-w-sm text-[13px] text-text-secondary">
                  Buscá en las 1.870 entradas de la tabla peruana, poné los gramos y el
                  aporte se calcula solo.
                </p>
              </CardBody>
            </Card>
          ) : (
            [...porTiempo.entries()].map(([tiempo, items]) => (
              <Card key={tiempo}>
                <CardBody className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-text-tertiary">
                    {tiempo}
                  </p>
                  {items.map(item => (
                    <FilaAlimento
                      key={item.id}
                      item={item}
                      onGramos={g => cambiarGramos(item.id, g)}
                      onOrigen={o => cambiarOrigen(item.id, o)}
                      onQuitar={() => quitarItem(item.id)}
                    />
                  ))}
                </CardBody>
              </Card>
            ))
          )}

          <Card>
            <CardBody>
              <label
                htmlFor="observaciones"
                className="mb-1.5 block text-[13px] font-semibold text-text-primary"
              >
                Observaciones
              </label>
              <textarea
                id="observaciones"
                rows={3}
                value={borrador.observaciones}
                onChange={e => actualizar(b => ({ ...b, observaciones: e.target.value }))}
                placeholder="Contexto de la entrevista, apetito, preparación…"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text-primary outline-none transition-colors focus:border-primary-400"
              />
            </CardBody>
          </Card>
        </div>

        {/* ── Totales ── */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <TablaNutrientes totales={totales} />
        </div>
      </div>

      {/* Mismo buscador del constructor de dietas: consulta al servidor con
          debounce de 300 ms. El Excel recorría las 1.870 filas de la hoja en
          cada tecla, unas 11.000 lecturas de celda por palabra escrita. */}
      <BuscadorAlimentosDrawer
        open={buscadorAbierto}
        onClose={() => setBuscadorAbierto(false)}
        nombreTiempo={tiempoDestino}
        onAgregar={agregarAlimento}
      />
    </div>
  )
}

interface FilaAlimentoProps {
  item: ItemConsumo
  onGramos: (gramos: number) => void
  onOrigen: (origen: OrigenAlimento) => void
  onQuitar: () => void
}

function FilaAlimento({ item, onGramos, onOrigen, onQuitar }: FilaAlimentoProps) {
  const kcal = item.aporte.energiaKcal
  const hierro = item.aporte.hierro

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-canvas px-3 py-2">
      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-primary">
        {item.nombreAlimento}
      </p>

      <div className="flex items-center gap-1">
        <input
          type="number"
          min={1}
          step={1}
          value={item.gramos}
          onChange={e => onGramos(Math.max(0, Number(e.target.value)))}
          className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-right text-[13px] tabular-nums outline-none focus:border-primary-400"
          aria-label={`Gramos de ${item.nombreAlimento}`}
        />
        <span className="text-[11px] text-text-tertiary">g</span>
      </div>

      <select
        value={item.origenAlimento}
        onChange={e => onOrigen(e.target.value as OrigenAlimento)}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-[12px] text-text-secondary outline-none focus:border-primary-400"
        aria-label={`Origen de ${item.nombreAlimento}`}
        title="Determina si el hierro cuenta como hemo o no hemo"
      >
        {ORIGENES.map(o => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      <span className="w-24 text-right text-[12px] tabular-nums text-text-secondary">
        {kcal === null ? '— kcal' : `${kcal.toFixed(0)} kcal`}
        {hierro !== null && (
          <span className="block text-[10px] text-text-tertiary">
            Fe {hierro.toFixed(2)} mg
          </span>
        )}
      </span>

      <button
        onClick={onQuitar}
        className="rounded-lg px-2 py-1 text-[12px] font-semibold text-text-tertiary transition-colors hover:bg-error/10 hover:text-error"
        aria-label={`Quitar ${item.nombreAlimento}`}
      >
        Quitar
      </button>
    </div>
  )
}
