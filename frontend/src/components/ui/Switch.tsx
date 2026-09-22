import { useId } from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Switch({ checked, onChange, label, description, disabled, className = '' }: SwitchProps) {
  const id = useId()

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full',
          'transition-colors duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:pointer-events-none',
          checked ? 'bg-primary-500' : 'bg-border-strong',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            checked ? 'translate-x-[1.15rem]' : 'translate-x-[0.15rem]',
          ].join(' ')}
        />
      </button>

      {(label || description) && (
        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer select-none">
          {label && <span className="block text-[13px] font-semibold text-text-primary">{label}</span>}
          {description && <span className="block text-xs text-text-tertiary">{description}</span>}
        </label>
      )}
    </div>
  )
}
