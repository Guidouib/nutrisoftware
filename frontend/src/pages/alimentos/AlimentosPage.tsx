import { useState, useMemo, useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { Alimento, Platillo, PlatilloIngrediente, FuenteAlimento, CategoriaAlimento } from '../../types/alimento'
import { alimentosService } from '../../services/alimentosService'

/* ── Constants ── */
type MainTab = 'catalogo' | 'platillos'
type FuenteFilter = FuenteAlimento | 'todos'

const FUENTE_META: Record<FuenteAlimento, { label: string; variant: 'success' | 'info' | 'warning' | 'primary' }> = {
  TPCA:         { label: 'TPCA',         variant: 'success' },
  SMAE:         { label: 'SMAE',         variant: 'info'    },
  USDA:         { label: 'USDA',         variant: 'warning' },
  personalizado:{ label: 'Personalizado',variant: 'primary' },
}

const CATEGORIAS: CategoriaAlimento[] = [
  'Cereales y tubérculos','Leguminosas','Frutas','Verduras',
  'Carnes y aves','Pescados y mariscos','Lácteos y huevos',
  'Grasas y aceites','Azúcares','Bebidas','Varios',
]

/* ── Schemas ── */
const alimentoSchema = z.object({
  nombre:        z.string().min(2, 'Mínimo 2 caracteres'),
  categoria:     z.string().min(1, 'Selecciona categoría'),
  energia:       z.coerce.number().min(0),
  proteinas:     z.coerce.number().min(0),
  grasas:        z.coerce.number().min(0),
  carbohidratos: z.coerce.number().min(0),
  fibra:         z.coerce.number().min(0),
  sodio:         z.coerce.number().min(0).optional(),
  calcio:        z.coerce.number().min(0).optional(),
  hierro:        z.coerce.number().min(0).optional(),
})
type AlimentoForm = z.infer<typeof alimentoSchema>

const platilloSchema = z.object({
  nombre:      z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  porciones:   z.coerce.number().min(1).max(20),
})
type PlatilloForm = z.infer<typeof platilloSchema>

/* ── Nutrient calc helper ── */
function calcNutriente(valor: number, gramos: number): string {
  return ((valor / 100) * gramos).toFixed(1)
}

/* ══════════════════════════════════════════════════════
   AlimentosPage
══════════════════════════════════════════════════════ */
export default function AlimentosPage() {
  /* ── State ── */
  const [alimentos, setAlimentos]     = useState<Alimento[]>([])
  const [platillos, setPlatillos]     = useState<Platillo[]>([])
  const [mainTab, setMainTab]         = useState<MainTab>('catalogo')
  const [fuenteFilter, setFuente]     = useState<FuenteFilter>('todos')
  const [categoriaFilter, setCategoria] = useState<string>('todas')
  const [search, setSearch]           = useState('')

  /* ── Calculator modal ── */
  const [calcTarget, setCalcTarget]   = useState<Alimento | null>(null)
  const [calcGramos, setCalcGramos]   = useState(100)

  /* ── Create food modal ── */
  const [createFoodOpen, setCreateFoodOpen] = useState(false)

  /* ── Platillo builder modal ── */
  const [platilloOpen, setPlatilloOpen]     = useState(false)
  const [platIngredientes, setPlatIngr]     = useState<PlatilloIngrediente[]>([])
  const [platSearchFood, setPlatSearchFood] = useState('')
  const [platGramos, setPlatGramos]         = useState<Record<string, number>>({})

  /* ── Forms ── */
  const { register: regFood, handleSubmit: submitFood, reset: resetFood, formState: { errors: foodErr } } =
    useForm<AlimentoForm>({ resolver: zodResolver(alimentoSchema) as unknown as Resolver<AlimentoForm> })

  useEffect(() => {
    alimentosService.getAll().then(setAlimentos).catch(console.error)
  }, [])

  const { register: regPl, handleSubmit: submitPl, reset: resetPl, formState: { errors: plErr } } =
    useForm<PlatilloForm>({ resolver: zodResolver(platilloSchema) as unknown as Resolver<PlatilloForm>, defaultValues: { porciones: 1 } })

  /* ── Filtered alimentos ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return alimentos.filter(a => {
      const matchSearch = !q || a.nombre.toLowerCase().includes(q) || a.categoria.toLowerCase().includes(q)
      const matchFuente = fuenteFilter === 'todos' || a.fuente === fuenteFilter
      const matchCat    = categoriaFilter === 'todas' || a.categoria === categoriaFilter
      return matchSearch && matchFuente && matchCat
    })
  }, [alimentos, search, fuenteFilter, categoriaFilter])

  /* ── Platillo search results ── */
  const platFoodResults = useMemo(() => {
    if (!platSearchFood.trim()) return []
    const q = platSearchFood.toLowerCase()
    const alreadyIds = new Set(platIngredientes.map(i => i.alimentoId))
    return alimentos.filter(a => a.nombre.toLowerCase().includes(q) && !alreadyIds.has(a.id)).slice(0, 6)
  }, [platSearchFood, alimentos, platIngredientes])

  /* ── Platillo totals ── */
  const platTotals = useMemo(() => {
    return platIngredientes.reduce((acc, ing) => {
      const food = alimentos.find(a => a.id === ing.alimentoId)
      if (!food) return acc
      const g = ing.gramos
      return {
        energia:       acc.energia       + (food.energia / 100) * g,
        proteinas:     acc.proteinas     + (food.proteinas / 100) * g,
        grasas:        acc.grasas        + (food.grasas / 100) * g,
        carbohidratos: acc.carbohidratos + (food.carbohidratos / 100) * g,
        fibra:         acc.fibra         + (food.fibra / 100) * g,
      }
    }, { energia: 0, proteinas: 0, grasas: 0, carbohidratos: 0, fibra: 0 })
  }, [platIngredientes, alimentos])

  /* ── Stats ── */
  const countTPCA = alimentos.filter(a => a.fuente === 'TPCA').length
  const countSMAE = alimentos.filter(a => a.fuente === 'SMAE').length
  const countUSDA = alimentos.filter(a => a.fuente === 'USDA').length
  const countCustom = alimentos.filter(a => a.esPersonalizado).length

  /* ── Handlers ── */
  const onCreateFood = async (data: AlimentoForm) => {
    try {
      const nuevo = await alimentosService.create({
        nombre:        data.nombre,
        categoria:     data.categoria,
        energia:       data.energia,
        proteinas:     data.proteinas,
        grasas:        data.grasas,
        carbohidratos: data.carbohidratos,
        fibra:         data.fibra,
        sodio:         data.sodio,
        calcio:        data.calcio,
        hierro:        data.hierro,
      })
      setAlimentos(prev => [...prev, nuevo])
      setCreateFoodOpen(false)
      resetFood()
      setFuente('personalizado')
    } catch (err) {
      console.error(err)
    }
  }

  const addIngredient = (food: Alimento) => {
    const gramos = platGramos[food.id] ?? 100
    const ing: PlatilloIngrediente = {
      alimentoId: food.id, alimentoNombre: food.nombre,
      fuente: food.fuente, gramos,
    }
    setPlatIngr(prev => [...prev, ing])
    setPlatSearchFood('')
  }

  const removeIngredient = (alimentoId: string) => {
    setPlatIngr(prev => prev.filter(i => i.alimentoId !== alimentoId))
  }

  const onCreatePlatillo = (data: PlatilloForm) => {
    if (platIngredientes.length === 0) return
    const nuevo: Platillo = {
      id: `pl_${Date.now()}`,
      nombre: data.nombre,
      descripcion: data.descripcion,
      ingredientes: platIngredientes,
      porciones: data.porciones,
      creadoEn: new Date().toISOString().slice(0, 10),
    }
    setPlatillos(prev => [...prev, nuevo])
    setPlatilloOpen(false)
    resetPl()
    setPlatIngr([])
    setPlatSearchFood('')
  }

  /* ── Platillo total nutrients per portion ── */
  const platilloTotales = (pl: Platillo) => {
    const totals = pl.ingredientes.reduce((acc, ing) => {
      const food = alimentos.find(a => a.id === ing.alimentoId)
      if (!food) return acc
      return {
        energia:       acc.energia       + (food.energia / 100) * ing.gramos,
        proteinas:     acc.proteinas     + (food.proteinas / 100) * ing.gramos,
        grasas:        acc.grasas        + (food.grasas / 100) * ing.gramos,
        carbohidratos: acc.carbohidratos + (food.carbohidratos / 100) * ing.gramos,
        fibra:         acc.fibra         + (food.fibra / 100) * ing.gramos,
      }
    }, { energia: 0, proteinas: 0, grasas: 0, carbohidratos: 0, fibra: 0 })
    return {
      energia:       totals.energia / pl.porciones,
      proteinas:     totals.proteinas / pl.porciones,
      grasas:        totals.grasas / pl.porciones,
      carbohidratos: totals.carbohidratos / pl.porciones,
      fibra:         totals.fibra / pl.porciones,
    }
  }

  return (
    <div className="w-full animate-fade-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">Catálogo de Alimentos</h1>
          <p className="text-sm text-text-tertiary mt-0.5">TPCA · SMAE · USDA · Alimentos y platillos personalizados</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {([
              { label: 'TPCA', color: 'bg-primary-500' },
              { label: 'SMAE', color: 'bg-blue-500' },
              { label: 'USDA', color: 'bg-amber-500' },
              { label: 'Personalizados', color: 'bg-violet-500' },
            ]).map(b => (
              <span key={b.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-canvas border border-border text-[10px] font-semibold text-text-tertiary">
                <span className={`w-1.5 h-1.5 rounded-full ${b.color} inline-block`} />
                {b.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { resetPl(); setPlatIngr([]); setPlatilloOpen(true) }} leftIcon={<IcoPlus />}>
            Nuevo platillo
          </Button>
          <Button size="sm" onClick={() => { resetFood(); setCreateFoodOpen(true) }} leftIcon={<IcoPlus />}>
            Agregar alimento
          </Button>
        </div>
      </div>

      {/* ── Hero search bar ── */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" aria-hidden>
          <IcoSearch />
        </span>
        <input
          type="search"
          placeholder="Buscar alimento por nombre o categoría..."
          value={mainTab === 'catalogo' ? search : ''}
          onChange={e => setSearch(e.target.value)}
          disabled={mainTab !== 'catalogo'}
          className="w-full h-12 pl-12 pr-4 text-[14px] bg-surface border border-border rounded-2xl text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-xs disabled:opacity-50"
        />
        {search && mainTab === 'catalogo' && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <IcoX />
          </button>
        )}
      </div>

      {/* ── Main tabs ── */}
      <div className="flex items-center gap-1 bg-canvas border border-border rounded-xl p-1 mb-5 w-fit">
        {([
          { key: 'catalogo', label: `Catálogo (${alimentos.length})` },
          { key: 'platillos', label: `Platillos (${platillos.length})` },
        ] as { key: MainTab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key)}
            className={[
              'px-4 py-2 rounded-lg text-[13px] font-semibold transition-all',
              mainTab === t.key
                ? 'bg-surface text-text-primary shadow-xs border border-border'
                : 'text-text-tertiary hover:text-text-primary',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═════════════════════════════
          TAB: CATÁLOGO
      ═════════════════════════════ */}
      {mainTab === 'catalogo' && (
        <div className="grid grid-cols-[200px_1fr] gap-5 items-start">

          {/* Left filter panel */}
          <div className="space-y-4">

            {/* Fuente filter */}
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
              <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.1em] mb-3">Base de datos</p>
              <div className="space-y-0.5">
                {([
                  { key: 'todos' as FuenteFilter, label: 'Todas', count: alimentos.length },
                  { key: 'TPCA' as FuenteFilter, label: 'TPCA', count: countTPCA },
                  { key: 'SMAE' as FuenteFilter, label: 'SMAE', count: countSMAE },
                  { key: 'USDA' as FuenteFilter, label: 'USDA', count: countUSDA },
                  { key: 'personalizado' as FuenteFilter, label: 'Personalizados', count: countCustom },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFuente(f.key)}
                    className={[
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all',
                      fuenteFilter === f.key
                        ? 'bg-primary-500 text-white'
                        : 'text-text-secondary hover:bg-canvas hover:text-text-primary',
                    ].join(' ')}
                  >
                    <span className="text-[13px] font-medium">{f.label}</span>
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${fuenteFilter === f.key ? 'bg-white/20 text-white' : 'bg-canvas text-text-disabled'}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
              <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.1em] mb-3">Categoría</p>
              <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-0.5">
                {['todas', ...CATEGORIAS].map(c => (
                  <button
                    key={c}
                    onClick={() => setCategoria(c)}
                    className={[
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] transition-all truncate',
                      categoriaFilter === c
                        ? 'bg-primary-500 text-white font-semibold'
                        : 'text-text-secondary hover:bg-canvas hover:text-text-primary',
                    ].join(' ')}
                  >
                    {c === 'todas' ? 'Todas' : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right content */}
          <div>
            <p className="text-[12px] text-text-tertiary mb-3">
              {filtered.length} {filtered.length === 1 ? 'alimento' : 'alimentos'}
              {search && <> para "<span className="text-text-primary font-medium">{search}</span>"</>}
            </p>

            {filtered.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                <div className="w-12 h-12 bg-canvas rounded-2xl flex items-center justify-center mx-auto mb-3 text-text-disabled">
                  <IcoFood />
                </div>
                <p className="font-semibold text-text-primary">Sin resultados</p>
                <p className="text-sm text-text-tertiary mt-1">
                  {search ? `No hay alimentos que coincidan con "${search}"` : 'No hay alimentos en esta categoría'}
                </p>
                <Button className="mt-4" size="sm" onClick={() => { setSearch(''); setFuente('todos'); setCategoria('todas') }} variant="outline">
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-canvas/60">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Alimento</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Fuente</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Categoría</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Energía</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Proteínas</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Carbos</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Grasas</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Fibra</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-canvas/50 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-canvas border border-border flex items-center justify-center flex-shrink-0 text-text-disabled">
                                <IcoFood />
                              </div>
                              <span className="font-medium text-text-primary text-[13px] group-hover:text-primary-600 transition-colors">
                                {a.nombre}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={FUENTE_META[a.fuente].variant}>{FUENTE_META[a.fuente].label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-text-secondary">{a.categoria}</td>
                          <NutrCell value={a.energia} unit="kcal" highlight />
                          <NutrCell value={a.proteinas} unit="g" />
                          <NutrCell value={a.carbohidratos} unit="g" />
                          <NutrCell value={a.grasas} unit="g" />
                          <NutrCell value={a.fibra} unit="g" />
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setCalcTarget(a); setCalcGramos(100) }}
                              className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-[11px] font-semibold hover:bg-primary-600 flex items-center gap-1.5 transition-colors"
                              aria-label={`Calcular nutrientes de ${a.nombre}`}
                            >
                              <IcoCalc />Calcular
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5 border-t border-border bg-canvas/40">
                  <p className="text-[10px] text-text-disabled">* Valores nutricionales por cada 100 g de alimento</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════
          TAB: PLATILLOS
      ═════════════════════════════ */}
      {mainTab === 'platillos' && (
        <div>
          {platillos.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 bg-canvas rounded-2xl flex items-center justify-center mx-auto mb-3 text-text-disabled">
                <IcoDish />
              </div>
              <p className="font-semibold text-text-primary">Sin platillos personalizados</p>
              <p className="text-sm text-text-tertiary mt-1">Crea combinaciones de alimentos con su cálculo nutricional automático</p>
              <Button
                className="mt-4" size="sm"
                onClick={() => { resetPl(); setPlatIngr([]); setPlatilloOpen(true) }}
                leftIcon={<IcoPlus />}
              >
                Crear primer platillo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {platillos.map(pl => {
                const totales = platilloTotales(pl)
                return (
                  <div key={pl.id} className="bg-surface border border-border rounded-2xl p-5 shadow-xs card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-text-primary text-[14px]">{pl.nombre}</h3>
                        {pl.descripcion && <p className="text-[12px] text-text-tertiary mt-0.5">{pl.descripcion}</p>}
                      </div>
                      <Badge variant="primary">{pl.porciones} porción{pl.porciones > 1 ? 'es' : ''}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-canvas rounded-xl border border-border">
                      <NutrMini label="Energía" value={totales.energia.toFixed(0)} unit="kcal" accent />
                      <NutrMini label="Proteínas" value={totales.proteinas.toFixed(1)} unit="g" />
                      <NutrMini label="Carbos" value={totales.carbohidratos.toFixed(1)} unit="g" />
                      <NutrMini label="Grasas" value={totales.grasas.toFixed(1)} unit="g" />
                      <NutrMini label="Fibra" value={totales.fibra.toFixed(1)} unit="g" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">
                        Ingredientes ({pl.ingredientes.length})
                      </p>
                      {pl.ingredientes.map(ing => (
                        <div key={ing.alimentoId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={FUENTE_META[ing.fuente].variant}>{FUENTE_META[ing.fuente].label}</Badge>
                            <span className="text-[12px] text-text-secondary">{ing.alimentoNombre}</span>
                          </div>
                          <span className="text-[12px] font-medium text-text-primary">{ing.gramos}g</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border">
                      <span className="text-[11px] text-text-disabled">
                        Creado el {new Date(pl.creadoEn).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL: Calculadora de nutrientes
      ══════════════════════════════════════ */}
      {calcTarget && (
        <Modal
          open={!!calcTarget}
          onClose={() => setCalcTarget(null)}
          title={`Calcular — ${calcTarget.nombre}`}
          description={`${FUENTE_META[calcTarget.fuente].label} · ${calcTarget.categoria}`}
          size="sm"
          footer={<Button onClick={() => setCalcTarget(null)}>Cerrar</Button>}
        >
          <div className="space-y-5">
            {/* Grams input */}
            <div>
              <label className="text-[12px] font-semibold text-text-secondary block mb-1.5">
                Cantidad en gramos
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={calcGramos}
                  onChange={e => setCalcGramos(Math.max(1, Number(e.target.value)))}
                  className="flex-1 h-11 px-4 text-[15px] font-semibold bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                <span className="text-[14px] font-medium text-text-tertiary">g</span>
              </div>
              {/* Quick presets */}
              <div className="flex items-center gap-2 mt-2">
                {[50, 100, 150, 200, 250].map(g => (
                  <button
                    key={g}
                    onClick={() => setCalcGramos(g)}
                    className={[
                      'px-3 py-1 rounded-lg text-[11px] font-semibold transition-all border',
                      calcGramos === g
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-canvas text-text-tertiary border-border hover:border-primary-300 hover:text-primary-600',
                    ].join(' ')}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2 p-4 bg-canvas border border-border rounded-xl">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-3">
                Nutrientes en {calcGramos}g
              </p>
              {[
                { label: 'Energía',       value: calcNutriente(calcTarget.energia, calcGramos),       unit: 'kcal', accent: true  },
                { label: 'Proteínas',     value: calcNutriente(calcTarget.proteinas, calcGramos),     unit: 'g',    accent: false },
                { label: 'Carbohidratos', value: calcNutriente(calcTarget.carbohidratos, calcGramos), unit: 'g',    accent: false },
                { label: 'Grasas',        value: calcNutriente(calcTarget.grasas, calcGramos),        unit: 'g',    accent: false },
                { label: 'Fibra',         value: calcNutriente(calcTarget.fibra, calcGramos),         unit: 'g',    accent: false },
                ...(calcTarget.sodio   !== undefined ? [{ label: 'Sodio',   value: calcNutriente(calcTarget.sodio,   calcGramos), unit: 'mg', accent: false }] : []),
                ...(calcTarget.calcio  !== undefined ? [{ label: 'Calcio',  value: calcNutriente(calcTarget.calcio,  calcGramos), unit: 'mg', accent: false }] : []),
                ...(calcTarget.hierro  !== undefined ? [{ label: 'Hierro',  value: calcNutriente(calcTarget.hierro,  calcGramos), unit: 'mg', accent: false }] : []),
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-[13px] text-text-secondary">{r.label}</span>
                  <span className={`text-[14px] font-bold ${r.accent ? 'text-primary-600' : 'text-text-primary'}`}>
                    {r.value} <span className="text-[12px] font-normal text-text-tertiary">{r.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════
          MODAL: Crear alimento personalizado
      ══════════════════════════════════════ */}
      <Modal
        open={createFoodOpen}
        onClose={() => setCreateFoodOpen(false)}
        title="Agregar alimento personalizado"
        description="Valores nutricionales por cada 100 g de alimento"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateFoodOpen(false)}>Cancelar</Button>
            <Button form="food-form" type="submit">Guardar alimento</Button>
          </>
        }
      >
        <form id="food-form" onSubmit={submitFood(onCreateFood)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Nombre del alimento *" placeholder="Ej: Quinua con leche" error={foodErr.nombre?.message} {...regFood('nombre')} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-secondary">Categoría *</label>
                <select
                  {...regFood('categoria')}
                  className="h-10 px-3 text-[13px] bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {foodErr.categoria && <p className="text-[11px] text-error">{foodErr.categoria.message}</p>}
              </div>
            </div>
            <div className="p-3 bg-canvas rounded-xl border border-border">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-3">Macronutrientes por 100g *</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Energía (kcal)" type="number" placeholder="0" error={foodErr.energia?.message} {...regFood('energia')} />
                <Input label="Proteínas (g)"  type="number" placeholder="0" error={foodErr.proteinas?.message} {...regFood('proteinas')} />
                <Input label="Grasas (g)"     type="number" placeholder="0" error={foodErr.grasas?.message} {...regFood('grasas')} />
                <Input label="Carbohidratos (g)" type="number" placeholder="0" error={foodErr.carbohidratos?.message} {...regFood('carbohidratos')} />
                <Input label="Fibra (g)"      type="number" placeholder="0" error={foodErr.fibra?.message} {...regFood('fibra')} />
              </div>
            </div>
            <div className="p-3 bg-canvas rounded-xl border border-border">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-3">Micronutrientes por 100g (opcional)</p>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Sodio (mg)"  type="number" placeholder="0" {...regFood('sodio')}  />
                <Input label="Calcio (mg)" type="number" placeholder="0" {...regFood('calcio')} />
                <Input label="Hierro (mg)" type="number" placeholder="0" {...regFood('hierro')} />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* ══════════════════════════════════════
          MODAL: Constructor de platillo
      ══════════════════════════════════════ */}
      <Modal
        open={platilloOpen}
        onClose={() => setPlatilloOpen(false)}
        title="Nuevo platillo personalizado"
        description="Combina alimentos y calcula los nutrientes automáticamente"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setPlatilloOpen(false)}>Cancelar</Button>
            <Button
              form="platillo-form" type="submit"
              disabled={platIngredientes.length === 0}
            >
              Guardar platillo
            </Button>
          </>
        }
      >
        <form id="platillo-form" onSubmit={submitPl(onCreatePlatillo)}>
          <div className="grid grid-cols-[1fr_320px] gap-5">

            {/* Left — builder */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre del platillo *" placeholder="Ej: Quinoto andino" error={plErr.nombre?.message} {...regPl('nombre')} />
                <Input label="Porciones" type="number" placeholder="1" {...regPl('porciones')} />
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-secondary">Descripción</label>
                  <textarea
                    {...regPl('descripcion')}
                    placeholder="Descripción breve del platillo..."
                    rows={2}
                    className="px-3 py-2 text-[13px] bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              {/* Food search to add ingredients */}
              <div>
                <label className="text-[12px] font-semibold text-text-secondary block mb-1.5">Buscar alimento para agregar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" aria-hidden>
                    <IcoSearch />
                  </span>
                  <input
                    type="search"
                    placeholder="Ej: quinua, pollo, arroz..."
                    value={platSearchFood}
                    onChange={e => setPlatSearchFood(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-[13px] bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Search results dropdown */}
                {platFoodResults.length > 0 && (
                  <div className="mt-1 bg-surface border border-border rounded-xl overflow-hidden shadow-md">
                    {platFoodResults.map(food => (
                      <div key={food.id} className="flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-0 hover:bg-canvas transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-text-primary truncate">{food.nombre}</p>
                          <p className="text-[11px] text-text-tertiary">{food.categoria} · {food.energia} kcal/100g</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input
                            type="number"
                            min={1}
                            defaultValue={100}
                            onChange={e => setPlatGramos(prev => ({ ...prev, [food.id]: Number(e.target.value) }))}
                            className="w-16 h-7 px-2 text-[12px] text-center bg-canvas border border-border rounded-lg focus:outline-none focus:border-primary-500"
                          />
                          <span className="text-[11px] text-text-tertiary">g</span>
                          <button
                            type="button"
                            onClick={() => addIngredient(food)}
                            className="px-2.5 py-1 rounded-lg bg-primary-500 text-white text-[11px] font-semibold hover:bg-primary-600 transition-colors"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ingredient list */}
              <div>
                <p className="text-[12px] font-semibold text-text-secondary mb-2">
                  Ingredientes {platIngredientes.length > 0 && `(${platIngredientes.length})`}
                </p>
                {platIngredientes.length === 0 ? (
                  <div className="flex items-center justify-center h-16 bg-canvas border border-dashed border-border rounded-xl">
                    <p className="text-[12px] text-text-disabled">Busca y agrega ingredientes arriba</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {platIngredientes.map(ing => {
                      const food = alimentos.find(a => a.id === ing.alimentoId)
                      return (
                        <div key={ing.alimentoId} className="flex items-center gap-3 px-3 py-2 bg-canvas border border-border rounded-xl">
                          <Badge variant={FUENTE_META[ing.fuente].variant}>{FUENTE_META[ing.fuente].label}</Badge>
                          <span className="flex-1 text-[13px] font-medium text-text-primary truncate">{ing.alimentoNombre}</span>
                          <span className="text-[13px] font-semibold text-text-primary">{ing.gramos}g</span>
                          {food && (
                            <span className="text-[11px] text-text-tertiary">
                              {((food.energia / 100) * ing.gramos).toFixed(0)} kcal
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeIngredient(ing.alimentoId)}
                            className="text-text-disabled hover:text-error transition-colors p-0.5"
                            aria-label={`Eliminar ${ing.alimentoNombre}`}
                          >
                            <IcoX />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right — live totals */}
            <div className="bg-canvas border border-border rounded-xl p-4 h-fit sticky top-0">
              <p className="text-[12px] font-semibold text-text-primary mb-4 flex items-center gap-2">
                <IcoCalc /> Totales por porción
              </p>
              {[
                { label: 'Energía',       value: platTotals.energia.toFixed(0),       unit: 'kcal', accent: true  },
                { label: 'Proteínas',     value: platTotals.proteinas.toFixed(1),     unit: 'g',    accent: false },
                { label: 'Carbohidratos', value: platTotals.carbohidratos.toFixed(1), unit: 'g',    accent: false },
                { label: 'Grasas',        value: platTotals.grasas.toFixed(1),        unit: 'g',    accent: false },
                { label: 'Fibra',         value: platTotals.fibra.toFixed(1),         unit: 'g',    accent: false },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <span className="text-[12px] text-text-secondary">{r.label}</span>
                  <span className={`text-[14px] font-bold ${r.accent ? 'text-primary-600' : 'text-text-primary'}`}>
                    {r.value}
                    <span className="text-[11px] font-normal text-text-tertiary ml-1">{r.unit}</span>
                  </span>
                </div>
              ))}

              {/* Macro bars */}
              {platTotals.energia > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">Distribución calórica</p>
                  {[
                    { label: 'Proteínas', kcal: platTotals.proteinas * 4, color: 'bg-blue-500' },
                    { label: 'Carbos',    kcal: platTotals.carbohidratos * 4, color: 'bg-amber-500' },
                    { label: 'Grasas',    kcal: platTotals.grasas * 9, color: 'bg-rose-500' },
                  ].map(m => {
                    const pct = platTotals.energia > 0 ? Math.round((m.kcal / platTotals.energia) * 100) : 0
                    return (
                      <div key={m.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-text-secondary">{m.label}</span>
                          <span className="text-[11px] font-semibold text-text-primary">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ── Sub-components ── */
function NutrCell({ value, unit, highlight }: { value: number; unit: string; highlight?: boolean }) {
  return (
    <td className="px-4 py-3 text-right">
      <span className={`text-[13px] font-medium ${highlight ? 'text-primary-600 font-semibold' : 'text-text-secondary'}`}>
        {value}
        <span className="text-[10px] text-text-disabled ml-0.5">{unit}</span>
      </span>
    </td>
  )
}

function NutrMini({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-[14px] font-bold ${accent ? 'text-primary-600' : 'text-text-primary'}`}>
        {value}<span className="text-[10px] font-normal text-text-tertiary ml-0.5">{unit}</span>
      </p>
      <p className="text-[10px] text-text-tertiary mt-0.5">{label}</p>
    </div>
  )
}

/* ── Icons ── */
function IcoPlus()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function IcoSearch() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IcoCalc()   { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4h4M4 6h4M4 8h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IcoFood()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 1.5C4.5 1.5 2.5 4 2.5 6.5c0 1.5.8 2.8 2 3.5V11.5h5V10c1.2-.7 2-2 2-3.5C11.5 4 9.5 1.5 7 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IcoDish()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><ellipse cx="7" cy="7" rx="5.5" ry="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 7v2.5C1.5 10.9 4 12 7 12s5.5-1.1 5.5-2.5V7" stroke="currentColor" strokeWidth="1.2"/></svg> }
function IcoX()      { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
