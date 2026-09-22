import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Sidebar from './Sidebar'
import { AvisoDemo } from './AvisoDemo'

export default function AppLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex w-full min-h-screen gap-6 bg-[#f8fafc]">
      {/* 1. BARRA LATERAL (SIDEBAR NEGRA) — el componente ya renderiza su propio
             <aside className="w-64 h-screen lg:sticky lg:top-0 flex-shrink-0 bg-[#0C120F]">
             junto con el drawer móvil, por eso no se envuelve en otro <aside>. */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* 2. CONTENEDOR DEL DASHBOARD CON AIRE EN LOS 4 COSTADOS */}
      <main className="flex min-h-screen min-w-0 flex-1 flex-col gap-6 overflow-y-auto pt-8 pr-6 pb-10 md:pr-8 md:pb-12">
        {/* Barra superior móvil */}
        <header className="flex h-14 flex-shrink-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            className="-ml-1 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600">
              <span className="text-xs font-bold text-white">N</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">NutriSoftware</span>
          </div>
        </header>

        <AvisoDemo />

        <Outlet />
      </main>
    </div>
  )
}
