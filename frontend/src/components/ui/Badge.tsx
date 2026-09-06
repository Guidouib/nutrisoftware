import { type ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'
type BadgeSize   = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: ReactNode
  className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',
  warning: 'bg-accent-50  text-accent-600  ring-1 ring-amber-200',
  error:   'bg-red-50     text-red-700     ring-1 ring-red-200',
  info:    'bg-blue-50    text-blue-700    ring-1 ring-blue-200',
  neutral: 'bg-gray-100   text-gray-600    ring-1 ring-gray-200',
  primary: 'bg-primary-500 text-white',
}

const dotMap: Record<BadgeVariant, string> = {
  success: 'bg-primary-500',
  warning: 'bg-accent-500',
  error:   'bg-red-500',
  info:    'bg-blue-500',
  neutral: 'bg-gray-400',
  primary: 'bg-white',
}

export function Badge({ variant = 'neutral', size = 'md', dot, children, className = '' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClass} ${variantMap[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[variant]}`} aria-hidden />}
      {children}
    </span>
  )
}
