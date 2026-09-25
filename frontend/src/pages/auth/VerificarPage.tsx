import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'

type Estado = 'verificando' | 'listo' | 'error'

/**
 * Destino del enlace que llega por correo: canjea el token y le dice al
 * usuario si puede entrar.
 */
export default function VerificarPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [estado, setEstado] = useState<Estado>('verificando')
  const [mensaje, setMensaje] = useState('')

  // El token es de un solo uso: en desarrollo, StrictMode monta el efecto dos
  // veces y el segundo intento fallaria sobre un token ya consumido.
  const yaIntentado = useRef(false)

  useEffect(() => {
    if (yaIntentado.current) return
    yaIntentado.current = true

    if (!token) {
      setEstado('error')
      setMensaje('El enlace no trae ningún código de verificación.')
      return
    }

    api
      .post('/auth/verificar', { token })
      .then(() => setEstado('listo'))
      .catch((error) => {
        setEstado('error')
        setMensaje(
          (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'No pudimos verificar tu correo. Probá pedir un enlace nuevo.'
        )
      })
  }, [token])

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F4F7F5', padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: '20px', padding: '40px',
          maxWidth: '440px', width: '100%', textAlign: 'center',
          boxShadow: '0 10px 40px rgba(20,60,40,.08)',
        }}
      >
        {estado === 'verificando' && (
          <>
            <h1 style={{ fontSize: '20px', color: '#1f2d24', margin: '0 0 8px' }}>
              Verificando tu correo…
            </h1>
            <p style={{ fontSize: '14px', color: '#5b6b61', margin: 0 }}>Un momento.</p>
          </>
        )}

        {estado === 'listo' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <h1 style={{ fontSize: '20px', color: '#1f2d24', margin: '0 0 8px' }}>
              Cuenta activada
            </h1>
            <p style={{ fontSize: '14px', color: '#5b6b61', margin: '0 0 24px', lineHeight: 1.6 }}>
              Tu correo quedó confirmado. Ya podés iniciar sesión.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block', background: '#0D9F63', color: '#fff',
                padding: '12px 28px', borderRadius: '12px', textDecoration: 'none',
                fontWeight: 600, fontSize: '14px',
              }}
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h1 style={{ fontSize: '20px', color: '#1f2d24', margin: '0 0 8px' }}>
              No pudimos verificar
            </h1>
            <p style={{ fontSize: '14px', color: '#5b6b61', margin: '0 0 24px', lineHeight: 1.6 }}>
              {mensaje}
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block', background: '#0D9F63', color: '#fff',
                padding: '12px 28px', borderRadius: '12px', textDecoration: 'none',
                fontWeight: 600, fontSize: '14px',
              }}
            >
              Volver al login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
