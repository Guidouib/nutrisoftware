import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, EstadoSuscripcion } from '../types/auth'

interface Suscripcion {
  estado: EstadoSuscripcion | null
  hasta: string | null
  diasRestantes: number | null
}

interface AuthState {
  user: { email: string; nombreCompleto: string; rol: string } | null
  suscripcion: Suscripcion | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      suscripcion: null,
      isAuthenticated: false,
      login: (data) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        set({
          user: { email: data.email, nombreCompleto: data.nombreCompleto, rol: data.rol },
          suscripcion: {
            estado: data.estadoSuscripcion ?? null,
            hasta: data.suscripcionHasta ?? null,
            diasRestantes: data.diasRestantes ?? null,
          },
          isAuthenticated: true,
        })
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, suscripcion: null, isAuthenticated: false })
      },
    }),
    { name: 'nutri-auth' }
  )
)
