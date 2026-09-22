import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sheet } from '../ui/Sheet'
import { ChipFuente } from './TablaAlimentos'
import { alimentosService } from '../../services/alimentosService'
import { gramosDeIntercambios, GRAMOS_POR_INTERCAMBIO } from '../../lib/dieta'
import type { Alimento } from '../../types/alimento'

const RETARDO_BUSQUEDA_MS = 300
const POR_PAGINA = 8

interface BuscadorAlimentosDrawerProps {
  open: boolean
  onClose: () => void
  /** Nombre del tiempo de comida destino — se muestra en el botón. */
  nombreTiempo: string
  onAgregar: (alimento: Alimento, gramos: number) => void
  /** Con el modo SMAE activo se puede capturar la cantidad en intercambios. */
  modoIntercambios?: boolean
}

export function BuscadorAlimentosDrawer({
  open,
  onClose,
  nombreTiempo,
  onAgregar,
  modoIntercambios = false,
}: BuscadorAlimentosDrawerProps) {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)
  const [seleccionado, setSeleccionado] = useState<Alimento | null>(null)
  const [gramos, setGramos] = useState(100)
  const [intercambios, setIntercambios] = useState(1)

  // Debounce de 300 ms sobre el texto tecleado.
  useEffect(() => {
    const id = setTimeout(() => {
      setBusqueda(texto)
      setPagina(0)
    }, RETARDO_BUSQUEDA_MS)
    return () => clearTimeout(id)
  }, [texto])

  const { data: resultados = [], isLoading } = useQuery<Alimento[]>({
    queryKey: ['alimentos', busqueda],
    queryFn: () => alimentosService.getAll(undefined, undefined, busqueda || undefined),
    enabled: open,
  })

  const totalPaginas = Math.max(1, Math.ceil(resultados.length / POR_PAGINA))
  const visibles = useMemo(
    () => resultados.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA),
    [resultados, pagina]
  )

  const equivalencia = seleccionado ? (GRAMOS_POR_INTERCAMBIO[seleccionado.categoria] ?? 50) : 0
  const gramosFinales = modoIntercambios && seleccionado
    ? gramosDeIntercambios(seleccionado.categoria, intercambios)
    : gramos

  const preview = seleccionado
    ? {
        energia: Math.round((seleccionado.energia * gramosFinales) / 100),
        proteinas: Math.round((seleccionado.proteinas * gramosFinales) / 10) / 10,
        carbohidratos: Math.round((seleccionado.carbohidratos * gramosFinales) / 10) / 10,
        grasas: Math.round((seleccionado.grasas * gramosFinales) / 10) / 10,
      }
    : null

  const confirmar = () => {
    if (!seleccionado || gramosFinales <= 0) return
    onAgregar(seleccionado, gramosFinales)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Agregar alimento"
      description={`Destino: ${nombreTiempo}`}
      width="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={!seleccionado || gramosFinales <= 0}
            className="rounded-xl bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
          >
            Agregar a {nombreTiempo}
          </button>
        </>
      }
    >
      {/* Buscador */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" aria-hidden>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          autoFocus
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Buscar en TPCA, SMAE, USDA y personalizados…"
          aria-label="Buscar alimento"
          className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3.5 text-[14px] text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Resultados */}
      <div className="mt-4 flex min-w-0 flex-col gap-2">
        {isLoading ? (
          <p className="py-6 text-center text-xs text-slate-500">Buscando…</p>
        ) : resultados.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            {busqueda ? `Sin resultados para "${busqueda}".` : 'Escribe para buscar un alimento.'}
          </p>
        ) : (
          visibles.map(a => {
            const activo = seleccionado?.id === a.id
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSeleccionado(a)}
                className={[
                  'flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors',
                  activo
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-border bg-white hover:border-primary-200 hover:bg-canvas',
                ].join(' ')}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-slate-800">{a.nombre}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {a.categoria} · {a.energia} kcal/100 g
                  </span>
                </span>
                <ChipFuente fuente={a.fuente} />
              </button>
            )
          })
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            disabled={pagina === 0}
            onClick={() => setPagina(p => p - 1)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-xs text-slate-500">
            Página {pagina + 1} de {totalPaginas} · {resultados.length} resultados
          </span>
          <button
            type="button"
            disabled={pagina >= totalPaginas - 1}
            onClick={() => setPagina(p => p + 1)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Cantidad + preview */}
      {seleccionado && (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-canvas p-4">
          <p className="text-base font-bold text-slate-800">{seleccionado.nombre}</p>
          <p className="text-xs text-slate-500">{seleccionado.categoria}</p>

          <div className="mt-3 flex flex-wrap items-end gap-4">
            {modoIntercambios ? (
              <div className="flex min-w-0 flex-col">
                <label htmlFor="intercambios" className="text-xs text-slate-500">Intercambios SMAE</label>
                <input
                  id="intercambios"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={intercambios}
                  onChange={e => setIntercambios(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1 h-10 w-28 rounded-xl border border-border bg-white px-3 text-[13px] tabular-nums focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">
                  1 intercambio ≈ {equivalencia} g · total {gramosFinales} g
                </p>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col">
                <label htmlFor="gramos" className="text-xs text-slate-500">Cantidad (g)</label>
                <input
                  id="gramos"
                  type="number"
                  min="1"
                  max="2000"
                  step="5"
                  value={gramos}
                  onChange={e => setGramos(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1 h-10 w-28 rounded-xl border border-border bg-white px-3 text-[13px] tabular-nums focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            )}

            {preview && (
              <div className="flex min-w-0 flex-1 flex-wrap items-end gap-4">
                {[
                  { etiqueta: 'kcal', valor: preview.energia },
                  { etiqueta: 'Proteínas', valor: `${preview.proteinas} g` },
                  { etiqueta: 'Carbohidratos', valor: `${preview.carbohidratos} g` },
                  { etiqueta: 'Grasas', valor: `${preview.grasas} g` },
                ].map(p => (
                  <div key={p.etiqueta} className="min-w-0">
                    <p className="text-sm font-bold tabular-nums text-slate-800">{p.valor}</p>
                    <p className="text-[11px] text-slate-500">{p.etiqueta}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Sheet>
  )
}
