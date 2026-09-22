import { type ReactNode } from 'react'
import type { NivelSemaforo } from '../../lib/semaforo'

interface SemaforoBadgeProps {
  nivel: NivelSemaforo
  children: ReactNode
  size?: 'sm' | 'md'
  /** Muestra el ícono de alerta (automático en `critico`). */
  icono?: boolean
  className?: string
}

const estiloMap: Record<NivelSemaforo, string> = {
  optimo:     'bg-primary-50 text-primary-700 ring-1 ring-primary-200',
  precaucion: 'bg-accent-50  text-accent-600  ring-1 ring-amber-200',
  critico:    'bg-red-50     text-red-700     ring-1 ring-red-200',
  neutro:     'bg-gray-100   text-gray-600    ring-1 ring-gray-200',
}

const puntoMap: Record<NivelSemaforo, string> = {
  optimo:     'bg-primary-500',
  precaucion: 'bg-accent-500',
  critico:    'bg-red-500',
  neutro:     'bg-gray-400',
}

function IconoAlerta() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" className="flex-shrink-0" aria-hidden>
      <path d="M6 .8L11.5 10.5a.6.6 0 01-.5.9H1a.6.6 0 01-.5-.9L6 .8zm0 3.4a.6.6 0 00-.6.65l.2 2.4a.4.4 0 00.8 0l.2-2.4A.6.6 0 006 4.2zm0 4.3a.7.7 0 100 1.4.7.7 0 000-1.4z" />
    </svg>
  )
}

/**
 * Semáforo clínico compartido por Antropometría, Bioquímica, Embarazada y Dieta.
 * Las funciones de clasificación viven en `src/lib/semaforo.ts`.
 */
export function SemaforoBadge({ nivel, children, size = 'md', icono, className = '' }: SemaforoBadgeProps) {
  const mostrarIcono = icono ?? nivel === 'critico'
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${estiloMap[nivel]} ${className}`}
    >
      {mostrarIcono ? (
        <IconoAlerta />
      ) : (
        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${puntoMap[nivel]}`} aria-hidden />
      )}
      {children}
    </span>
  )
}
