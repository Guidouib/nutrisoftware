interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'muted'
  className?: string
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }
const colorMap = {
  primary: 'border-primary-200 border-t-primary-500',
  white:   'border-white/30 border-t-white',
  muted:   'border-border border-t-text-tertiary',
}

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block rounded-full border-2 ${sizeMap[size]} ${colorMap[color]} ${className}`}
      style={{ animation: 'spin 0.7s linear infinite' }}
    />
  )
}
