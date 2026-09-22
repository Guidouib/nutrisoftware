import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ConfiguradorPDF } from '../../components/reportes/ConfiguradorPDF'
import { SemaforoBadge } from '../../components/evaluacion/SemaforoBadge'
import { guardarBlobComo, reporteService } from '../../services/reporteService'
import { useDieta } from '../../hooks/useDieta'
import { usePaciente } from '../../hooks/useEvaluacion'
import { useAuthStore } from '../../stores/authStore'
import { DIAS_SEMANA, listaDeCompras, nutrientesDe, totalesDeDia } from '../../lib/dieta'
import { edadEnAnios } from '../../lib/antropometria'
import {
  ESQUEMAS_COLOR,
  SECCIONES_POR_DEFECTO,
  type ConfiguracionPdf,
  type PdfGenerado,
} from '../../types/reporte'
import type { Dieta } from '../../types/dieta'
import type { Paciente } from '../../types/paciente'

function formatoFechaHora(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatoTamanio(bytes: number | null): string {
  if (bytes === null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`
}

/* ── Vista previa del documento ──────────────────────────────── */

function VistaPreviaPdf({
  config,
  dieta,
  paciente,
}: {
  config: ConfiguracionPdf
  dieta: Dieta | null
  paciente: Paciente | undefined
}) {
  const esquema = ESQUEMAS_COLOR.find(e => e.valor === config.esquemaColor) ?? ESQUEMAS_COLOR[0]
  const compras = dieta ? listaDeCompras(dieta) : []

  return (
    <div
      className="mx-auto w-full max-w-[46rem] rounded-lg bg-white p-8 shadow-sm"
      style={{ fontFamily: `${config.fuente}, system-ui, sans-serif` }}
    >
      {/* Membrete */}
      <div className="flex items-start justify-between gap-4 border-b-2 pb-4" style={{ borderColor: esquema.hex }}>
        <div className="min-w-0">
          <h1 className="text-xl font-bold" style={{ color: esquema.hex }}>{config.titulo}</h1>
          <p className="mt-0.5 text-xs text-slate-600">{config.consultorio}</p>
          <p className="text-xs text-slate-500">{config.profesional}</p>
          {config.contacto && <p className="text-[11px] text-slate-500">{config.contacto}</p>}
        </div>
        {config.logoDataUrl && (
          <img src={config.logoDataUrl} alt="" className="max-h-14 w-auto flex-shrink-0 object-contain" />
        )}
      </div>

      {/* Datos del paciente */}
      {config.secciones.datosPaciente && (
        <section className="mt-5">
          <h2 className="text-sm font-bold" style={{ color: esquema.hex }}>Datos del paciente</h2>
          <div className="mt-2 rounded-lg p-3" style={{ background: esquema.suave }}>
            {paciente ? (
              <p className="text-xs text-slate-700">
                <strong>{paciente.nombre} {paciente.apellido}</strong> · {edadEnAnios(paciente.fechaNacimiento)} años ·{' '}
                {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                {paciente.dni ? ` · DNI ${paciente.dni}` : ''}
              </p>
            ) : (
              <p className="text-xs text-slate-500">—</p>
            )}
          </div>
        </section>
      )}

      {/* Requerimientos */}
      {config.secciones.requerimientos && dieta && (
        <section className="mt-5">
          <h2 className="text-sm font-bold" style={{ color: esquema.hex }}>Requerimientos nutricionales</h2>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[
              { t: 'Energía', v: `${dieta.requerimientos.kcal} kcal` },
              { t: 'Proteínas', v: `${dieta.requerimientos.proteinasG} g` },
              { t: 'Carbohidratos', v: `${dieta.requerimientos.carbohidratosG} g` },
              { t: 'Grasas', v: `${dieta.requerimientos.grasasG} g` },
            ].map(m => (
              <div key={m.t} className="rounded-lg p-2.5 text-center" style={{ background: esquema.suave }}>
                <p className="text-sm font-bold text-slate-800">{m.v}</p>
                <p className="text-[10px] text-slate-500">{m.t}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dieta día por día */}
      {config.secciones.dietaPorDia && dieta && (
        <section className="mt-5">
          <h2 className="text-sm font-bold" style={{ color: esquema.hex }}>Plan semanal</h2>
          {dieta.dias.map(dia => {
            const conAlimentos = dia.tiempos.filter(t => t.alimentos.length > 0)
            const totales = totalesDeDia(dia)
            return (
              <div key={dia.diaSemana} className="mt-3 break-inside-avoid">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-1">
                  <h3 className="text-xs font-bold text-slate-800">{DIAS_SEMANA[dia.diaSemana].largo}</h3>
                  <span className="text-[10px] text-slate-500">{totales.energia} kcal</span>
                </div>
                {conAlimentos.length === 0 ? (
                  <p className="mt-1 text-[11px] italic text-slate-400">Sin alimentos asignados</p>
                ) : (
                  conAlimentos.map(t => (
                    <div key={t.id} className="mt-1.5">
                      <p className="text-[11px] font-semibold text-slate-700">{t.nombre}</p>
                      <ul className="mt-0.5">
                        {t.alimentos.map(a => (
                          <li key={a.id} className="flex justify-between gap-3 text-[11px] text-slate-600">
                            <span className="min-w-0 truncate">{a.nombre} — {a.gramos} g</span>
                            <span className="flex-shrink-0 tabular-nums">{nutrientesDe(a).energia} kcal</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </section>
      )}

      {/* Lista de compras */}
      {config.secciones.listaCompras && (
        <section className="mt-5">
          <h2 className="text-sm font-bold" style={{ color: esquema.hex }}>Lista de compras semanal</h2>
          {compras.length === 0 ? (
            <p className="mt-1 text-[11px] italic text-slate-400">La dieta aún no tiene alimentos.</p>
          ) : (
            <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
              {compras.map(c => (
                <li key={c.nombre} className="flex justify-between gap-2 text-[11px] text-slate-600">
                  <span className="min-w-0 truncate">{c.nombre}</span>
                  <span className="flex-shrink-0 tabular-nums font-semibold">{c.gramos} g</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Recomendaciones */}
      {config.secciones.recomendaciones && config.recomendaciones.trim() && (
        <section className="mt-5">
          <h2 className="text-sm font-bold" style={{ color: esquema.hex }}>Recomendaciones generales</h2>
          <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-slate-600">
            {config.recomendaciones}
          </p>
        </section>
      )}

      {/* Firma */}
      {config.secciones.firma && (
        <section className="mt-10 flex justify-end">
          <div className="w-56 border-t border-slate-400 pt-1 text-center">
            <p className="text-[11px] font-semibold text-slate-700">{config.profesional}</p>
            <p className="text-[10px] text-slate-500">Firma y sello</p>
          </div>
        </section>
      )}
    </div>
  )
}

/* ── Página ───────────────────────────────────────────────────── */

export default function ExportarPDFPage() {
  const { pacienteId, dietaId } = useParams<{ pacienteId: string; dietaId: string }>()
  const qc = useQueryClient()
  const usuario = useAuthStore(s => s.user)

  const { data: paciente } = usePaciente(pacienteId)
  const { dieta, cargando } = useDieta(pacienteId, dietaId, null)

  const guardado = useMemo(() => reporteService.leerConfiguracion(), [])

  const [config, setConfig] = useState<ConfiguracionPdf>({
    titulo: 'Plan Nutricional',
    logoDataUrl: null,
    consultorio: 'Consultorio de Nutrición',
    profesional: usuario?.nombreCompleto ?? '',
    contacto: usuario?.email ?? '',
    secciones: SECCIONES_POR_DEFECTO,
    recomendaciones: '',
    esquemaColor: 'verde',
    fuente: 'Inter',
    ...guardado,
  })

  const actualizarConfig = (cambio: Partial<ConfiguracionPdf>) =>
    setConfig(prev => {
      const siguiente = { ...prev, ...cambio }
      reporteService.guardarConfiguracion(siguiente)
      return siguiente
    })

  const { data: historial = [] } = useQuery<PdfGenerado[]>({
    queryKey: ['reportes', pacienteId],
    queryFn: () => reporteService.historial(pacienteId!),
    enabled: Boolean(pacienteId),
  })

  const generar = useMutation({
    mutationFn: () =>
      reporteService.generar({ pacienteId: pacienteId!, dietaId: dietaId!, configuracion: config }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reportes', pacienteId] })
    },
  })

  const descargar = useMutation({
    mutationFn: async (reporte: PdfGenerado) => {
      const blob = await reporteService.descargar(reporte.id)
      guardarBlobComo(blob, `${reporte.tipo.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    },
  })

  const enviar = useMutation({
    mutationFn: (reporteId: string) => reporteService.enviarPorEmail(reporteId),
  })

  // El backend responde 501 mientras no haya proveedor de correo configurado.
  const errorEnvio = (enviar.error as { response?: { status?: number; data?: { error?: string } } } | null)
  const mensajeEnvio = errorEnvio?.response?.status === 501
    ? errorEnvio.response.data?.error ?? 'El envío por email todavía no está disponible.'
    : enviar.isError ? 'No se pudo enviar el reporte.' : null

  const ultimo = generar.data

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* ── Encabezado ── */}
      <header className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/dietas/${pacienteId}/${dietaId}`}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            ← Volver a la dieta
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Exportar a PDF
          </h1>
          <p className="text-xs text-slate-500 md:text-sm">
            {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Cargando paciente…'}
            {dieta ? ` · ${dieta.nombre}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => generar.mutate()}
          disabled={generar.isPending || !dieta}
          className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
        >
          {generar.isPending ? 'Generando tu reporte…' : 'Generar PDF'}
        </button>
      </header>

      {/* ── Resultado de la generación ── */}
      {generar.isPending && (
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-5 w-5 rounded-full border-2 border-primary-200 border-t-primary-500"
              style={{ animation: 'spin 0.7s linear infinite' }}
              role="status"
              aria-label="Generando"
            />
            <p className="text-[13px] text-slate-800">Generando tu reporte…</p>
          </div>
        </section>
      )}

      {ultimo && !generar.isPending && (
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800">
                {ultimo.estado === 'listo' ? 'Reporte listo' : 'Reporte en espera del backend'}
              </h2>
              <p className="text-xs text-slate-500">
                {ultimo.estado === 'listo'
                  ? `Generado el ${formatoFechaHora(ultimo.fecha)}`
                  : 'La configuración quedó guardada. El archivo se emitirá cuando el endpoint de QuestPDF esté disponible.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SemaforoBadge nivel={ultimo.estado === 'listo' ? 'optimo' : 'precaucion'}>
                {ultimo.estado === 'listo' ? 'Disponible' : 'Pendiente'}
              </SemaforoBadge>
              {ultimo.estado === 'listo' && (
                <button
                  type="button"
                  onClick={() => descargar.mutate(ultimo)}
                  disabled={descargar.isPending}
                  className="rounded-xl bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-50"
                >
                  {descargar.isPending ? 'Descargando…' : 'Descargar PDF'}
                </button>
              )}
              <button
                type="button"
                onClick={() => enviar.mutate(ultimo.id)}
                disabled={ultimo.estado !== 'listo' || enviar.isPending}
                className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas disabled:pointer-events-none disabled:opacity-50"
              >
                {enviar.isPending ? 'Enviando…' : 'Enviar por email al paciente'}
              </button>
            </div>
          </div>

          {(mensajeEnvio || descargar.isError) && (
            <p className="mt-3 text-xs text-accent-600">
              {mensajeEnvio ?? 'No se pudo descargar el archivo.'}
            </p>
          )}
        </section>
      )}

      {/* ── Configurador + vista previa ── */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-2">
          <ConfiguradorPDF config={config} onChange={actualizarConfig} />
        </div>

        <div className="min-w-0 lg:col-span-3">
          <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800">Vista previa</h2>
            <p className="text-xs text-slate-500">Refleja la configuración en tiempo real</p>

            <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-xl bg-slate-100 p-4 shadow-inner">
              {cargando ? (
                <p className="py-10 text-center text-xs text-slate-500">Cargando dieta…</p>
              ) : !dieta ? (
                <p className="py-10 text-center text-xs text-slate-500">
                  No se encontró la dieta solicitada.
                </p>
              ) : (
                <VistaPreviaPdf config={config} dieta={dieta} paciente={paciente} />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ── Historial ── */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">PDFs generados</h2>
        <p className="text-xs text-slate-500">Quedan archivados en el expediente del paciente</p>

        {historial.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8">
            <p className="text-lg font-bold text-slate-800">Sin reportes generados</p>
            <p className="text-xs text-slate-500">El primero que generes aparecerá acá.</p>
          </div>
        ) : (
          <div className="mt-4 w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Fecha', 'Tipo de reporte', 'Tamaño', 'Estado', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="min-w-0 px-3 py-2.5 text-slate-800">{formatoFechaHora(r.fecha)}</td>
                    <td className="min-w-0 max-w-[14rem] px-3 py-2.5 text-slate-500">
                      <span className="block truncate">{r.tipo}</span>
                    </td>
                    <td className="min-w-0 px-3 py-2.5 tabular-nums text-slate-500">{formatoTamanio(r.tamanioBytes)}</td>
                    <td className="min-w-0 px-3 py-2.5">
                      <SemaforoBadge size="sm" nivel={r.estado === 'listo' ? 'optimo' : 'precaucion'}>
                        {r.estado === 'listo' ? 'Disponible' : 'Pendiente'}
                      </SemaforoBadge>
                    </td>
                    <td className="min-w-0 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => descargar.mutate(r)}
                          disabled={r.estado !== 'listo' || descargar.isPending}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:pointer-events-none disabled:text-text-disabled"
                        >
                          Descargar
                        </button>
                        <button
                          type="button"
                          onClick={() => enviar.mutate(r.id)}
                          disabled={r.estado !== 'listo'}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:pointer-events-none disabled:text-text-disabled"
                        >
                          Reenviar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
