import { useRef, useState } from 'react'
import { Switch } from '../ui/Switch'
import {
  ESQUEMAS_COLOR,
  ETIQUETAS_SECCION,
  FUENTES_PDF,
  type ConfiguracionPdf,
  type EsquemaColorPdf,
  type FuentePdf,
  type SeccionesPdf,
} from '../../types/reporte'

const TAMANIO_MAX_LOGO = 512 * 1024 // 512 KB

const claseInput =
  'mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'

interface ConfiguradorPDFProps {
  config: ConfiguracionPdf
  onChange: (cambio: Partial<ConfiguracionPdf>) => void
}

export function ConfiguradorPDF({ config, onChange }: ConfiguradorPDFProps) {
  const inputArchivo = useRef<HTMLInputElement>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [errorLogo, setErrorLogo] = useState<string | null>(null)

  const cargarLogo = (archivo: File | undefined) => {
    setErrorLogo(null)
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setErrorLogo('El archivo debe ser una imagen.')
      return
    }
    if (archivo.size > TAMANIO_MAX_LOGO) {
      setErrorLogo('La imagen supera los 512 KB.')
      return
    }
    const lector = new FileReader()
    lector.onload = () => onChange({ logoDataUrl: String(lector.result) })
    lector.onerror = () => setErrorLogo('No se pudo leer la imagen.')
    lector.readAsDataURL(archivo)
  }

  const cambiarSeccion = (clave: keyof SeccionesPdf, valor: boolean) =>
    onChange({ secciones: { ...config.secciones, [clave]: valor } })

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {/* ── Membrete ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Membrete</h2>
        <p className="text-xs text-slate-500">Logo y datos del consultorio</p>

        {/* Zona de carga del logo */}
        <div
          onDragOver={e => {
            e.preventDefault()
            setArrastrando(true)
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={e => {
            e.preventDefault()
            setArrastrando(false)
            cargarLogo(e.dataTransfer.files[0])
          }}
          className={[
            'mt-4 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors',
            arrastrando ? 'border-primary-400 bg-primary-50' : 'border-slate-300 bg-canvas',
          ].join(' ')}
        >
          {config.logoDataUrl ? (
            <>
              <img
                src={config.logoDataUrl}
                alt="Logo del consultorio"
                className="max-h-20 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => onChange({ logoDataUrl: null })}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Quitar logo
              </button>
            </>
          ) : (
            <>
              <p className="text-center text-xs text-slate-500">
                Arrastra tu logo aquí o
              </p>
              <button
                type="button"
                onClick={() => inputArchivo.current?.click()}
                className="rounded-xl border border-border bg-white px-3 py-2 text-[13px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
              >
                Seleccionar imagen
              </button>
              <p className="text-[11px] text-slate-500">PNG o JPG, hasta 512 KB</p>
            </>
          )}
          <input
            ref={inputArchivo}
            type="file"
            accept="image/*"
            hidden
            onChange={e => cargarLogo(e.target.files?.[0])}
          />
        </div>
        {errorLogo && <p className="mt-1 text-xs text-red-500">{errorLogo}</p>}

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="flex min-w-0 flex-col">
            <label htmlFor="consultorio" className="text-xs text-slate-500">Nombre del consultorio</label>
            <input
              id="consultorio"
              value={config.consultorio}
              onChange={e => onChange({ consultorio: e.target.value })}
              className={claseInput}
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <label htmlFor="profesional" className="text-xs text-slate-500">Profesional responsable</label>
            <input
              id="profesional"
              value={config.profesional}
              onChange={e => onChange({ profesional: e.target.value })}
              className={claseInput}
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <label htmlFor="contacto" className="text-xs text-slate-500">Datos de contacto</label>
            <input
              id="contacto"
              value={config.contacto}
              onChange={e => onChange({ contacto: e.target.value })}
              placeholder="Teléfono · correo · dirección"
              className={claseInput}
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <label htmlFor="titulo" className="text-xs text-slate-500">Título del documento</label>
            <input
              id="titulo"
              value={config.titulo}
              onChange={e => onChange({ titulo: e.target.value })}
              className={claseInput}
            />
          </div>
        </div>
      </section>

      {/* ── Secciones ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Secciones incluidas</h2>
        <p className="text-xs text-slate-500">Se reflejan al instante en la vista previa</p>

        <div className="mt-4 flex flex-col gap-4">
          {(Object.keys(ETIQUETAS_SECCION) as (keyof SeccionesPdf)[]).map(clave => (
            <Switch
              key={clave}
              checked={config.secciones[clave]}
              onChange={v => cambiarSeccion(clave, v)}
              label={ETIQUETAS_SECCION[clave].titulo}
              description={ETIQUETAS_SECCION[clave].detalle}
            />
          ))}
        </div>

        {config.secciones.recomendaciones && (
          <div className="mt-4 flex min-w-0 flex-col">
            <label htmlFor="recomendaciones" className="text-xs text-slate-500">Recomendaciones generales</label>
            <textarea
              id="recomendaciones"
              rows={4}
              value={config.recomendaciones}
              onChange={e => onChange({ recomendaciones: e.target.value })}
              placeholder="Hidratación, actividad física, horarios, señales de alarma…"
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-text-primary placeholder:text-text-disabled focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        )}
      </section>

      {/* ── Apariencia ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Apariencia</h2>
        <p className="text-xs text-slate-500">Color de acento y tipografía del documento</p>

        <p className="mt-4 text-xs text-slate-500">Esquema de colores</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ESQUEMAS_COLOR.map(e => {
            const activo = config.esquemaColor === e.valor
            return (
              <button
                key={e.valor}
                type="button"
                onClick={() => onChange({ esquemaColor: e.valor as EsquemaColorPdf })}
                aria-pressed={activo}
                className={[
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-semibold transition-colors',
                  activo ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-border bg-white text-text-primary hover:bg-canvas',
                ].join(' ')}
              >
                <span className="h-3.5 w-3.5 rounded-full" style={{ background: e.hex }} aria-hidden />
                {e.titulo}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex min-w-0 flex-col">
          <label htmlFor="fuente" className="text-xs text-slate-500">Fuente</label>
          <select
            id="fuente"
            value={config.fuente}
            onChange={e => onChange({ fuente: e.target.value as FuentePdf })}
            className={claseInput}
          >
            {FUENTES_PDF.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </section>
    </div>
  )
}
