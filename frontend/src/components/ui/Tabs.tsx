import { type ReactNode } from 'react'

export interface TabItem {
  value: string
  label: ReactNode
  /** Contador o punto de estado a la derecha de la etiqueta. */
  badge?: ReactNode
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  /** 'pill' = fondo relleno (días de dieta) · 'underline' = subrayado (secciones) */
  variant?: 'pill' | 'underline'
  size?: 'sm' | 'md'
  className?: string
  'aria-label'?: string
}

const sizeMap = {
  sm: 'h-8 px-3 text-[12px] gap-1.5',
  md: 'h-10 px-4 text-[13px] gap-2',
}

export function Tabs({
  items,
  value,
  onChange,
  variant = 'pill',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
}: TabsProps) {
  const contenedor =
    variant === 'pill'
      ? 'inline-flex min-w-0 flex-wrap items-center gap-1 rounded-xl bg-canvas p-1'
      : 'flex min-w-0 flex-wrap items-center gap-1 border-b border-border'

  const estilo = (activo: boolean) => {
    if (variant === 'pill') {
      return activo
        ? 'bg-primary-500 text-white shadow-sm'
        : 'text-text-tertiary hover:bg-white hover:text-text-primary'
    }
    return activo
      ? '-mb-px border-b-2 border-primary-500 text-text-primary'
      : '-mb-px border-b-2 border-transparent text-text-tertiary hover:text-text-primary'
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className={`${contenedor} ${className}`}>
      {items.map(item => {
        const activo = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={activo}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={[
              'inline-flex items-center justify-center rounded-lg font-semibold',
              'transition-colors duration-150 select-none cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
              'disabled:opacity-40 disabled:pointer-events-none',
              sizeMap[size],
              estilo(activo),
            ].join(' ')}
          >
            <span className="truncate">{item.label}</span>
            {item.badge}
          </button>
        )
      })}
    </div>
  )
}
