import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onRightIconClick?: () => void
  /** 'md' ~40px  |  'lg' ~48px (use in auth forms) */
  inputSize?: 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, leftIcon, rightIcon, onRightIconClick,
  inputSize = 'md', className = '', id, ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const heightClass = inputSize === 'lg' ? 'h-12' : 'h-10'
  const textClass   = inputSize === 'lg' ? 'text-[14px]' : 'text-[13px]'
  const plClass     = leftIcon  ? (inputSize === 'lg' ? 'pl-11' : 'pl-10') : (inputSize === 'lg' ? 'pl-4' : 'pl-3.5')
  const prClass     = rightIcon ? 'pr-11' : 'pr-3.5'

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-semibold text-text-secondary">
          {label}
          {props.required && <span className="text-error ml-0.5" aria-hidden>*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className={`absolute ${inputSize === 'lg' ? 'left-3.5' : 'left-3'} top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none flex items-center`}
            aria-hidden
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={[
            'w-full bg-surface text-text-primary placeholder:text-text-disabled font-body',
            heightClass, textClass,
            'border border-border rounded-xl',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            error ? 'border-error focus:ring-error/20 focus:border-error bg-red-50/30' : '',
            plClass, prClass,
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-canvas',
            className,
          ].join(' ')}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            tabIndex={-1}
            aria-label="Toggle visibilidad"
            className={`absolute ${inputSize === 'lg' ? 'right-3.5' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center text-text-disabled hover:text-text-tertiary transition-colors`}
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 text-[11px] text-error font-medium">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" className="flex-shrink-0" aria-hidden>
            <path d="M5.5.5a5 5 0 100 10 5 5 0 000-10zm0 7.25a.75.75 0 110-1.5.75.75 0 010 1.5zM6.25 5a.75.75 0 01-1.5 0V3.5a.75.75 0 011.5 0V5z"/>
          </svg>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-[11px] text-text-disabled">{hint}</p>
      )}
    </div>
  )
})
Input.displayName = 'Input'
