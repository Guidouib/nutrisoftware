import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '../types/auth'

interface AuthState {
  user: { email: string; nombreCompleto: string; rol: string } | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (data) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        set({
          user: { email: data.email, nombreCompleto: data.nombreCompleto, rol: data.rol },
          isAuthenticated: true,
        })
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'nutri-auth' }
  )
)
