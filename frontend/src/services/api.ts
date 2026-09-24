import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ────────────────────────────────────────────────────────────────
   RENOVACIÓN DE SESIÓN

   El access token dura 15 minutos. Antes, al vencer, el interceptor
   borraba todo y mandaba al login: la sesión se cortaba a mitad de una
   consulta y el autoguardado del constructor de dietas —que corre cada
   2 segundos— se perdía con el 401.

   Ahora el primer 401 dispara una renovación contra /auth/refresh y la
   petición original se reintenta sola. El usuario no se entera.
   ──────────────────────────────────────────────────────────────── */

/** Marca para no reintentar dos veces la misma petición. */
interface ConfigConReintento extends InternalAxiosRequestConfig {
  _reintentado?: boolean
}

/**
 * Mientras una renovación está en curso, las demás peticiones esperan a esa
 * misma promesa. Sin esto, diez llamadas en paralelo dispararían diez
 * renovaciones y —como el servidor rota el token— nueve fallarían.
 */
let renovacionEnCurso: Promise<string> | null = null

function cerrarSesion(): never {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('nutri-auth')
  // replace y no href: evita que el botón «atrás» vuelva a una pantalla
  // que ya no tiene sesión.
  window.location.replace('/login')
  throw new Error('Sesión finalizada')
}

async function renovarSesion(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) cerrarSesion()

  // Instancia aparte, sin interceptores: si la renovación respondiera 401
  // con el interceptor puesto, se llamaría a sí misma en bucle.
  const { data } = await axios.post('/api/auth/refresh', { refreshToken })

  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  return data.accessToken as string
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as ConfigConReintento | undefined

    const esRenovable =
      error.response?.status === 401 &&
      original !== undefined &&
      !original._reintentado &&
      // El login fallido también devuelve 401 y no hay nada que renovar.
      !original.url?.includes('/auth/')

    if (!esRenovable) return Promise.reject(error)

    original._reintentado = true

    try {
      renovacionEnCurso ??= renovarSesion().finally(() => {
        renovacionEnCurso = null
      })

      const nuevoToken = await renovacionEnCurso
      original.headers.Authorization = `Bearer ${nuevoToken}`
      return api(original)
    } catch {
      // El refresh token venció, fue revocado o el usuario quedó inactivo:
      // acá sí no queda más que volver a entrar.
      cerrarSesion()
    }
  }
)
