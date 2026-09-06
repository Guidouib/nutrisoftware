import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm btn-shimmer',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 ring-1 ring-inset ring-primary-200',
  ghost:     'text-text-secondary hover:bg-border hover:text-text-primary',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  outline:   'bg-surface text-text-primary ring-1 ring-inset ring-border hover:ring-border-strong hover:bg-canvas',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8  px-3   text-[12px] gap-1.5 rounded-lg',
  md: 'h-9  px-4   text-[13px] gap-2   rounded-xl',
  lg: 'h-12 px-6   text-[14px] gap-2   rounded-xl font-semibold',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center font-semibold font-body',
        'transition-all duration-150 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading
        ? <Spinner size={size === 'sm' ? 'sm' : 'sm'} color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
        : leftIcon
      }
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
}
