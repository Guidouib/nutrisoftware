import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** Ancho del panel en desktop. */
  width?: 'md' | 'lg'
}

const widthMap = {
  md: 'lg:max-w-md',
  lg: 'lg:max-w-lg',
}

/**
 * Panel lateral en desktop (entra desde la derecha) y bottom sheet en mobile.
 * Mismo contrato de foco/scroll/Escape que `Modal`.
 */
export function Sheet({ open, onClose, title, description, children, footer, width = 'md' }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previo
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
      aria-describedby={description ? 'sheet-desc' : undefined}
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
        style={{ animation: 'fadeIn 0.15s ease' }}
      />

      <div
        tabIndex={-1}
        className={[
          'relative flex w-full min-w-0 flex-col bg-surface shadow-xl outline-none',
          'max-h-[88vh] rounded-t-2xl border-t border-border',
          'lg:h-full lg:max-h-none lg:rounded-none lg:rounded-l-2xl lg:border-t-0 lg:border-l',
          widthMap[width],
        ].join(' ')}
        style={{ animation: 'sheetIn 0.22s var(--ease-out)' }}
      >
        {(title || description) && (
          <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-border px-6 pt-6 pb-4">
            <div className="min-w-0">
              {title && (
                <h2 id="sheet-title" className="text-base font-bold text-slate-800">
                  {title}
                </h2>
              )}
              {description && (
                <p id="sheet-desc" className="mt-0.5 text-xs text-slate-500">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="flex-shrink-0 rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-canvas hover:text-text-primary"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M3.22 3.22a.75.75 0 011.06 0L8 6.94l3.72-3.72a.75.75 0 111.06 1.06L9.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L8 9.06l-3.72 3.72a.75.75 0 01-1.06-1.06L6.94 8 3.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            </button>
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
