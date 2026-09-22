import { useId, type ReactNode } from 'react'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  /** Texto a la derecha del label — típicamente el valor formateado. */
  valueLabel?: ReactNode
  /** Marcas de referencia bajo la pista. */
  marks?: { value: number; label: string }[]
  disabled?: boolean
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueLabel,
  marks,
  disabled,
  className = '',
}: SliderProps) {
  const id = useId()

  return (
    <div className={`flex w-full min-w-0 flex-col gap-2 ${className}`}>
      {(label || valueLabel !== undefined) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={id} className="text-xs font-medium text-slate-500">
              {label}
            </label>
          )}
          {valueLabel !== undefined && (
            <span className="text-[13px] font-bold text-text-primary tabular-nums">{valueLabel}</span>
          )}
        </div>
      )}

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
        className={[
          'h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-40',
        ].join(' ')}
      />

      {marks && marks.length > 0 && (
        <div className="flex items-center justify-between">
          {marks.map(m => (
            <span key={m.value} className="text-[11px] text-text-tertiary tabular-nums">
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
