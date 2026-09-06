import { type ReactNode } from 'react'

type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost'

interface CardProps {
  variant?: CardVariant
  className?: string
  children: ReactNode
  onClick?: () => void
  as?: 'div' | 'article' | 'section' | 'li'
}

const variantMap: Record<CardVariant, string> = {
  default:  'bg-surface border border-border shadow-xs',
  elevated: 'bg-surface border border-border shadow-md',
  bordered: 'bg-surface border-2 border-border',
  ghost:    'bg-transparent',
}

export function Card({ variant = 'default', className = '', children, onClick, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={[
        'rounded-2xl overflow-hidden',
        variantMap[variant],
        onClick ? 'cursor-pointer hover:border-primary-200 hover:shadow-md transition-all duration-200' : '',
        className,
      ].join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`px-6 py-5 border-b border-border ${className}`}>{children}</div>
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`px-6 py-4 bg-background/50 border-t border-border ${className}`}>{children}</div>
}
