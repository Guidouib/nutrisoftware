import { useState } from 'react'
import { Card, CardBody } from '../ui/Card'
import {
  HIERRO_DESGLOSE,
  NUTRIENTES,
  NUTRIENTES_DESTACADOS,
  type Nutriente,
} from '../../lib/nutrientes'
import type { TotalesConsumo } from '../../types/consumo'

interface TablaNutrientesProps {
  totales: TotalesConsumo
}

/**
 * Totales del recordatorio con su completitud a la vista.
 *
 * El Excel multiplicaba `Val(celda)` por los gramos, y `Val("•")` —el
 * marcador de «sin dato» de la tabla— devuelve 0. Con 5.009 celdas sin dato
 * sobre 41.140, las encuestas salían subestimadas sin que nadie lo notara.
 * Acá el faltante no suma y además se avisa cuántos alimentos quedaron fuera
 * de cada total.
 */
export function TablaNutrientes({ totales }: TablaNutrientesProps) {
  const [verTodo, setVerTodo] = useState(false)

  const hayItems = totales.totalItems > 0
  const incompletos = NUTRIENTES.filter(
    n => (totales.itemsSinDato[n.clave] ?? 0) > 0
  ).length

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[15px] font-bold text-text-primary">Totales del día</h2>
          <span className="text-[11px] text-text-tertiary">
            {totales.totalItems} {totales.totalItems === 1 ? 'alimento' : 'alimentos'}
          </span>
        </div>

        {!hayItems ? (
          <p className="py-6 text-center text-[13px] text-text-tertiary">
            Agregá alimentos para ver los totales.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-2">
              {NUTRIENTES_DESTACADOS.map(n => (
                <CeldaDestacada
                  key={n.clave}
                  nutriente={n}
                  valor={totales.valores[n.clave]}
                  sinDato={totales.itemsSinDato[n.clave] ?? 0}
                  totalItems={totales.totalItems}
                />
              ))}
            </dl>

            {/* Desglose del hierro: la tabla trae un solo valor y la
                biodisponibilidad del hemo (15-35 %) y el no hemo (2-20 %) no
                son comparables, así que se reparte por origen del alimento. */}
            <div className="rounded-xl border border-border px-3 py-2.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
                Hierro por origen
              </p>
              <dl className="flex flex-col gap-1">
                {HIERRO_DESGLOSE.map(n => (
                  <div key={n.clave} className="flex items-baseline justify-between gap-2">
                    <dt className="text-[12px] text-text-secondary">{n.etiqueta}</dt>
                    <dd className="text-[13px] font-semibold tabular-nums text-text-primary">
                      {(totales.valores[n.clave] ?? 0).toFixed(n.decimales)}{' '}
                      <span className="text-[10px] font-normal text-text-tertiary">
                        {n.unidad}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {incompletos > 0 && (
              <div className="rounded-xl border border-amber-200 bg-accent-50 px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-accent-600">
                  <strong>{incompletos} de {NUTRIENTES.length} totales están incompletos.</strong>{' '}
                  La tabla de composición no tiene el dato para algunos alimentos. Los
                  faltantes no se suman como cero: el total real es igual o mayor al que
                  se muestra.
                </p>
              </div>
            )}

            <button
              onClick={() => setVerTodo(v => !v)}
              className="text-left text-[12px] font-semibold text-primary-600 hover:underline"
            >
              {verTodo ? 'Ocultar el detalle' : `Ver los ${NUTRIENTES.length} nutrientes`}
            </button>

            {verTodo && (
              <dl className="flex flex-col divide-y divide-border">
                {NUTRIENTES.map(n => {
                  const sinDato = totales.itemsSinDato[n.clave] ?? 0
                  const todosFaltan = sinDato === totales.totalItems
                  return (
                    <div key={n.clave} className="flex items-baseline justify-between gap-2 py-1.5">
                      <dt className="min-w-0 truncate text-[12px] text-text-secondary">
                        {n.etiqueta}
                      </dt>
                      <dd className="flex shrink-0 items-baseline gap-1.5">
                        {sinDato > 0 && (
                          <span
                            className="text-[10px] text-accent-600"
                            title={`${sinDato} de ${totales.totalItems} alimentos sin este dato en la tabla`}
                          >
                            {sinDato}/{totales.totalItems} s/d
                          </span>
                        )}
                        <span
                          className={[
                            'text-[13px] font-semibold tabular-nums',
                            todosFaltan ? 'text-text-tertiary' : 'text-text-primary',
                          ].join(' ')}
                        >
                          {todosFaltan ? '—' : totales.valores[n.clave]?.toFixed(n.decimales)}
                        </span>
                        <span className="w-8 text-[10px] text-text-tertiary">{n.unidad}</span>
                      </dd>
                    </div>
                  )
                })}
              </dl>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}

interface CeldaDestacadaProps {
  nutriente: Nutriente
  valor: number | undefined
  sinDato: number
  totalItems: number
}

function CeldaDestacada({ nutriente, valor, sinDato, totalItems }: CeldaDestacadaProps) {
  const todosFaltan = sinDato === totalItems

  return (
    <div className="rounded-xl bg-canvas px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        {nutriente.etiqueta}
      </dt>
      <dd className="text-[16px] font-bold tabular-nums text-text-primary">
        {todosFaltan ? '—' : (valor ?? 0).toFixed(nutriente.decimales)}{' '}
        <span className="text-[10px] font-medium text-text-tertiary">{nutriente.unidad}</span>
      </dd>
      {sinDato > 0 && (
        <p className="text-[10px] text-accent-600" title="Alimentos sin este dato en la tabla">
          {sinDato} sin dato
        </p>
      )}
    </div>
  )
}
