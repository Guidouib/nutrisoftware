import { useState, type ReactNode } from 'react'

/** Contenedor: apila los items con separación uniforme. */
export function Accordion({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex w-full min-w-0 flex-col gap-3 ${className}`}>{children}</div>
}

interface AccordionItemProps {
  title: ReactNode
  /** Línea auxiliar bajo el título. */
  subtitle?: ReactNode
  /** Contenido alineado a la derecha del header (subtotales, badges). */
  right?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export function AccordionItem({
  title,
  subtitle,
  right,
  defaultOpen = false,
  children,
  className = '',
}: AccordionItemProps) {
  const [abierto, setAbierto] = useState(defaultOpen)

  return (
    <section
      className={`w-full min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}
    >
      <div className="flex w-full min-w-0 items-center gap-3 p-6">
        <button
          type="button"
          onClick={() => setAbierto(o => !o)}
          aria-expanded={abierto}
          className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
        >
          <span
            aria-hidden
            className={`flex-shrink-0 text-text-disabled transition-transform duration-200 ${abierto ? 'rotate-90' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-bold text-slate-800">{title}</span>
            {subtitle && <span className="block truncate text-xs text-slate-500">{subtitle}</span>}
          </span>
        </button>

        {right && <div className="flex flex-shrink-0 items-center gap-2">{right}</div>}
      </div>

      {abierto && (
        <div className="min-w-0 border-t border-slate-100 p-6 animate-fade-in">{children}</div>
      )}
    </section>
  )
}
