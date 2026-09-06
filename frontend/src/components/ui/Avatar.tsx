type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name?: string
  src?: string
  size?: AvatarSize
  className?: string
}

const sizeMap: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6  h-6',  text: 'text-[10px]' },
  sm: { container: 'w-8  h-8',  text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
  xl: { container: 'w-16 h-16', text: 'text-xl' },
}

function getInitials(name?: string) {
  if (!name) return 'U'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const colors = [
  'from-primary-400 to-primary-600',
  'from-emerald-400 to-teal-600',
  'from-accent-400 to-accent-600',
  'from-blue-400 to-indigo-600',
]

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const { container, text } = sizeMap[size]
  const colorIdx = (name?.charCodeAt(0) ?? 0) % colors.length

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={`${container} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      aria-label={name ?? 'Usuario'}
      className={`${container} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className={`${text} font-semibold text-white leading-none font-display`}>
        {getInitials(name)}
      </span>
    </div>
  )
}
