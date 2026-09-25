export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nombres: string
  apellidos: string
  especialidad?: string
  telefono?: string
}

/** Situación de la suscripción tal como la informa el servidor. */
export type EstadoSuscripcion =
  | 'SinVencimiento'
  | 'Activa'
  | 'PorVencer'
  | 'Vencida'
  | 'Suspendida'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email: string
  nombreCompleto: string
  rol: string

  /**
   * Viaja en la respuesta de sesión porque, con la suscripción vencida, el
   * resto del API responde 402: el login es el único lugar donde el frontend
   * puede enterarse del motivo.
   */
  estadoSuscripcion?: EstadoSuscripcion | null
  suscripcionHasta?: string | null
  diasRestantes?: number | null
}
