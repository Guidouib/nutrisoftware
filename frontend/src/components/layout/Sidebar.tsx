import type { JSX } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

/* ─────────────────────────────────────────────────────────────
   MODELO DE NAVEGACIÓN
   ───────────────────────────────────────────────────────────── */
type NavLeaf = { to: string; label: string; end?: boolean; Icon: () => JSX.Element }

const NAV_GROUPS: { label: string; items: NavLeaf[] }[] = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', label: 'Dashboard', end: true, Icon: IconGrid },
      { to: '/citas',     label: 'Citas',                 Icon: IconCalendar },
      { to: '/pacientes', label: 'Pacientes',             Icon: IconUsers },
    ],
  },
  {
    label: 'Clínica',
    items: [
      { to: '/alimentos',    label: 'Alimentos',    Icon: IconDrop },
      { to: '/evaluaciones', label: 'Evaluaciones', Icon: IconClipboard },
      { to: '/dietas',       label: 'Dietas',       Icon: IconBowl },
      { to: '/consumo',      label: 'Consumo',      Icon: IconPlato },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { to: '/seguimiento', label: 'Seguimiento',  Icon: IconTrend },
      { to: '/reportes',    label: 'Reportes PDF', Icon: IconDoc },
    ],
  },
]

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────────────────────── */
interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const name = user?.nombreCompleto ?? 'Usuario'
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden
        />
      )}

      <aside
        aria-label="Navegación principal"
        className={[
          // base + móvil (drawer)
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-shrink-0 flex-col bg-[#0C120F] select-none',
          'transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // escritorio: en flujo, pegado arriba, sin offsets heredados del drawer
          'lg:sticky lg:top-0 lg:bottom-auto lg:translate-x-0',
        ].join(' ')}
      >
        {/* ── Marca ── */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500 shadow-sm">
            <IconLeaf />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight text-white">NutriSoftware</p>
            <p className="text-xs font-medium leading-tight text-primary-400">Panel Profesional</p>
          </div>
        </div>

        {/* ── Badge de plan ── */}
        <div className="mx-4 mb-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3.5 py-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-500">
              <IconStar />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight text-white">Plan Starter</p>
              <p className="truncate text-xs leading-tight text-slate-400">
                {user ? '0 de 25 pacientes' : '—'}
              </p>
            </div>
            <IconSync />
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-0 rounded-full bg-accent-400" />
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-7 last:mb-0">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map(({ to, label, end, Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
                        ].join(' ')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                            <Icon />
                          </span>
                          <span className="truncate">{label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Usuario ── */}
        <div className="border-t border-white/[0.07] p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.06]">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold leading-tight text-white">{name}</span>
              <span className="block truncate text-xs leading-tight text-slate-400">{user?.email}</span>
            </span>
            <IconChevron />
          </button>

          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-red-400"
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   ICONOS — 20×20, stroke 1.6, currentColor
   ───────────────────────────────────────────────────────────── */
const S = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': true } as const

function IconGrid() {
  return (
    <svg {...S}>
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg {...S}>
      <rect x="2.5" y="3.5" width="15" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 1.5v3.5M13.5 1.5v3.5M2.5 8h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg {...S}>
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 9.5c1.6 0 2.8 1.1 2.8 2.7 0 1.1-.5 2-1.6 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconDrop() {
  return (
    <svg {...S}>
      <path d="M10 2.5c2.8 2.7 5.5 5.8 5.5 8.8a5.5 5.5 0 01-11 0c0-3 2.7-6.1 5.5-8.8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg {...S}>
      <rect x="3.5" y="3.5" width="13" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 3.5V5a.7.7 0 00.7.7h4.6A.7.7 0 0013 5V3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9.5h6.5M7 12.5h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconBowl() {
  return (
    <svg {...S}>
      <ellipse cx="10" cy="6" rx="6.5" ry="2.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6v6.5c0 1.7 2.9 3.2 6.5 3.2s6.5-1.5 6.5-3.2V6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10c0 1.7 2.9 3.2 6.5 3.2s6.5-1.5 6.5-3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
/** Plato con cubiertos: lo que el paciente declaró haber comido. */
function IconPlato() {
  return (
    <svg {...S}>
      <circle cx="9" cy="10" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16.2 3.5v6.2M16.2 9.7v6.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function IconTrend() {
  return (
    <svg {...S}>
      <path d="M2.5 14.5l4.5-5.5 3.6 3.2L17 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 4.5H17v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconDoc() {
  return (
    <svg {...S}>
      <path d="M11 2.5H5.5a2 2 0 00-2 2v11a2 2 0 002 2h9a2 2 0 002-2V8l-5.5-5.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11 2.5V8h5.5M6.5 11.5h7M6.5 14h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconLeaf() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 2.5C5.7 2.5 3 5.2 3 8.5S5.7 14.5 9 14.5s6-2.7 6-6c0-2.1-1-4-2.5-5.2" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 5.5v3.5l2.5 1.8" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconStar() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L1.7 5.7l4-.6L7.5 1.5z" fill="white" />
    </svg>
  )
}
function IconSync() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-slate-500" aria-hidden>
      <path d="M13 4a5.5 5.5 0 10.9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.3 1.7v2.5h-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-slate-500" aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M7 16H4a1.7 1.7 0 01-1.7-1.7V3.7A1.7 1.7 0 014 2h3M12.5 12.5L16 9l-3.5-3.5M16 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
