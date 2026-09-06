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

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email: string
  nombreCompleto: string
  rol: string
}
