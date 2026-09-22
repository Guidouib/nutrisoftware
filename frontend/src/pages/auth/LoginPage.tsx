import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../services/api'
import { CredencialesDemo } from '../../components/layout/AvisoDemo'

/* ── Schema ── */
const schema = z.object({
  email:    z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
type FormData = z.infer<typeof schema>

/* ── Check icon ── */
function IcoCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7.5L6 10.5L11 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Feature items ── */
const features = [
  { label: 'Evaluación nutricional ISAK',  icon: <IcoCheck /> },
  { label: 'Dietas personalizadas con IA', icon: <IcoCheck /> },
  { label: 'Seguimiento y evolución',       icon: <IcoCheck /> },
  { label: 'Reportes en PDF',              icon: <IcoCheck /> },
]

/* ── Trust badges ── */
const trustItems = [
  {
    label: 'SSL seguro',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M6 .5L1 2.5v3.8c0 2.5 2 4.2 5 4.2s5-1.7 5-4.2V2.5L6 .5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        <path d="M4 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Datos privados',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M4 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: '99.9% uptime',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M1.5 8l2-2.5 2 2 2.5-4 2 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

/* ═══════════════════════════════════════════════ */
export default function LoginPage() {
  const [showPwd, setShowPwd]         = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate  = useNavigate()
  const loginUser = useAuthStore(s => s.login)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await api.post('/auth/login', data)
      loginUser(res.data)
      navigate('/dashboard')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setServerError(err.response?.data?.message ?? 'Credenciales incorrectas')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ══════════════════════════════════════
          PANEL IZQUIERDO — 58%
      ══════════════════════════════════════ */}
      <aside
        style={{
          width: '58%',
          flexShrink: 0,
          background: 'linear-gradient(160deg, #060D08 0%, #081208 45%, #0A1A0D 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '36px 48px 32px',
        }}
        aria-label="NutriSoftware — Plataforma clínica"
      >

        {/* BG: grid sutil */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} aria-hidden />

        {/* BG: glow inferior izquierdo */}
        <div style={{
          position: 'absolute', bottom: '-120px', left: '-60px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,159,99,0.22) 0%, transparent 65%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} aria-hidden />

        {/* BG: glow superior derecho */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,159,99,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} aria-hidden />

        {/* BG: hoja decorativa */}
        <svg
          style={{ position: 'absolute', bottom: 0, right: -20, opacity: 0.04, pointerEvents: 'none' }}
          width="380" height="420" viewBox="0 0 380 420" fill="none"
          aria-hidden
        >
          <path d="M190 400 C190 400 20 300 20 150 C20 50 100 10 190 10 C280 10 360 50 360 150 C360 300 190 400 190 400Z" fill="#22C55E"/>
          <path d="M190 400 C190 400 60 280 80 160 C100 60 160 30 190 10" fill="#16A34A" opacity="0.5"/>
          <path d="M190 10 L190 400" stroke="#22C55E" strokeWidth="2" opacity="0.3"/>
          <path d="M20 150 C80 200 150 220 190 400" stroke="#22C55E" strokeWidth="1.5" opacity="0.25"/>
          <path d="M360 150 C300 200 230 220 190 400" stroke="#22C55E" strokeWidth="1.5" opacity="0.25"/>
        </svg>

        {/* ── CONTENIDO ── */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
              background: 'linear-gradient(135deg, #0D9F63 0%, #077A48 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(13,159,99,0.4)',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2C5 2 2.5 4.5 2.5 8S5 14 8 14s5.5-2.5 5.5-6c0-2-.9-3.8-2.3-5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M8 5v3.5l2.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>
              NutriSoftware
            </span>
          </div>

          {/* Contenido central */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '22px' }}>

            {/* Pill métrica */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px', borderRadius: '999px',
              background: 'rgba(13,159,99,0.13)',
              border: '1px solid rgba(13,159,99,0.28)',
              width: 'fit-content',
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.9)',
              }} aria-hidden />
              <span style={{ color: 'rgba(34,197,94,0.95)', fontSize: '12px', fontWeight: 600 }}>
                Hoy más de 2,400 nutricionistas confían en NutriSoftware
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 style={{
                fontSize: 'clamp(30px, 3.2vw, 42px)',
                fontWeight: 800, lineHeight: 1.08,
                letterSpacing: '-0.8px', margin: 0,
              }}>
                <span style={{ color: '#FFFFFF', display: 'block' }}>La plataforma clínica</span>
                <span style={{ color: '#22C55E', display: 'block' }}>diseñada para crecer</span>
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.48)', fontSize: '14px',
                lineHeight: 1.65, maxWidth: '360px', margin: '14px 0 0',
              }}>
                Gestiona pacientes, genera dietas personalizadas y toma decisiones clínicas respaldadas por datos.
              </p>
            </div>

            {/* Features 2×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {features.map(f => (
                <div key={f.label} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(13,159,99,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} aria-hidden>
                    {f.icon}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12.5px', fontWeight: 500, lineHeight: 1.3 }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div style={{
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '18px 20px',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'rgba(34,197,94,0.5)', fontSize: '28px', lineHeight: 1, flexShrink: 0, marginTop: '-2px', fontFamily: 'Georgia, serif' }}>
                  "
                </span>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '13px', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                  Antes tardaba 2 horas por paciente. Ahora en 30 minutos tengo la evaluación completa y la dieta lista.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #0D9F63 0%, #064E32 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: '#fff',
                    border: '2px solid rgba(13,159,99,0.4)',
                  }} aria-hidden>
                    AM
                  </div>
                  <div>
                    <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600, margin: 0, lineHeight: 1.2 }}>
                      Lic. Andrea Martínez
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: '2px 0 0', lineHeight: 1 }}>
                      Nutricionista · Lima, Perú
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px' }} aria-label="5 estrellas">
                  {[0,1,2,3,4].map(i => (
                    <svg key={i} width="13" height="13" viewBox="0 0 12 12" fill="#F59E0B" aria-hidden>
                      <path d="M6 1l1.3 2.7 3 .4-2.2 2.1.5 3L6 7.8 3.4 9.2l.5-3L1.7 4.1l3-.4L6 1z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Footer social proof */}
          <div style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex' }}>
                {['#0D9F63','#0580A8','#7C3AED','#D97706'].map((c, i) => (
                  <div key={i} style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    backgroundColor: c,
                    border: '2px solid #060D08',
                    marginLeft: i > 0 ? '-8px' : '0',
                    zIndex: 4 - i,
                    position: 'relative',
                  }} aria-hidden />
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px' }}>
                Confiado por nutricionistas en toda Latinoamérica
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#F59E0B" aria-hidden>
                <path d="M6 1l1.3 2.7 3 .4-2.2 2.1.5 3L6 7.8 3.4 9.2l.5-3L1.7 4.1l3-.4L6 1z"/>
              </svg>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600 }}>4.9</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          PANEL DERECHO — 42%
      ══════════════════════════════════════ */}
      <section
        style={{
          flex: 1,
          background: '#F2F5F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 28px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '38px 36px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #E8EDE9',
          }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0B1812', letterSpacing: '-0.4px', margin: '0 0 6px' }}>
                Bienvenido de vuelta
              </h2>
              <p style={{ fontSize: '14px', color: '#7A9882', margin: 0 }}>
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  style={{ color: '#0D9F63', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Regístrate gratis
                </Link>
              </p>
            </div>

            {/* Credenciales de la demo pública (solo con VITE_MODO_DEMO=true) */}
            <div style={{ marginBottom: '16px' }}>
              <CredencialesDemo />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="login-email" style={{ fontSize: '13px', fontWeight: 600, color: '#374B3E' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#B4C8BB', display: 'flex', pointerEvents: 'none' }} aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1.5 5.5l6.5 4.5 6.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@clinica.com"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                    className="auth-input"
                    style={fieldStyle(!!errors.email)}
                  />
                </div>
                {errors.email && <ErrMsg msg={errors.email.message!} />}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '13px', fontWeight: 600, color: '#374B3E' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#B4C8BB', display: 'flex', pointerEvents: 'none' }} aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <circle cx="8" cy="11" r="1.2" fill="currentColor"/>
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    aria-invalid={!!errors.password}
                    {...register('password')}
                    className="auth-input"
                    style={{ ...fieldStyle(!!errors.password), paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#B4C8BB',
                      display: 'flex', alignItems: 'center', padding: '4px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#7A9882')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#B4C8BB')}
                  >
                    {showPwd ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M14 8C12 10.5 10.1 12 8 12S4 10.5 2 8C4 5.5 5.9 4 8 4S12 5.5 14 8z" stroke="currentColor" strokeWidth="1.3"/>
                        <circle cx="8" cy="8" r="2" fill="currentColor"/>
                        <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M14 8C12 10.5 10.1 12 8 12S4 10.5 2 8C4 5.5 5.9 4 8 4S12 5.5 14 8z" stroke="currentColor" strokeWidth="1.3"/>
                        <circle cx="8" cy="8" r="2" fill="currentColor"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <ErrMsg msg={errors.password.message!} />}
              </div>

              {/* Forgot password */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
                <a
                  href="#"
                  style={{ fontSize: '13px', color: '#7A9882', fontWeight: 500, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#0D9F63')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7A9882')}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Server error */}
              {serverError && (
                <div role="alert" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '10px',
                  background: '#FEF2F2', border: '1px solid #FCA5A5',
                  color: '#DC2626', fontSize: '13px', fontWeight: 500,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ flexShrink: 0 }} aria-hidden>
                    <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 9.25a.75.75 0 110-1.5.75.75 0 010 1.5zM7.75 7a.75.75 0 01-1.5 0V4.5a.75.75 0 011.5 0V7z"/>
                  </svg>
                  {serverError}
                </div>
              )}

              {/* Submit button */}
              <SubmitBtn loading={isSubmitting} />
            </form>

            {/* Trust row */}
            <div style={{
              marginTop: '22px', paddingTop: '18px',
              borderTop: '1px solid #EEF2EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '20px',
            }}>
              {trustItems.map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#0D9F63', display: 'flex' }}>{b.icon}</span>
                  <span style={{ fontSize: '11.5px', color: '#A8BCAE', fontWeight: 500 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Error message ── */
function ErrMsg({ msg }: { msg: string }) {
  return (
    <p role="alert" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#DC2626', fontWeight: 500, margin: 0 }}>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" style={{ flexShrink: 0 }} aria-hidden>
        <path d="M5.5.5a5 5 0 100 10 5 5 0 000-10zm0 7.25a.75.75 0 110-1.5.75.75 0 010 1.5zM6.25 5a.75.75 0 01-1.5 0V3.5a.75.75 0 011.5 0V5z"/>
      </svg>
      {msg}
    </p>
  )
}

/* ── Submit button ── */
function SubmitBtn({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        height: '52px', width: '100%', borderRadius: '12px',
        background: loading ? 'rgba(13,159,99,0.65)' : 'linear-gradient(135deg, #10A868 0%, #0B8555 100%)',
        color: '#FFFFFF',
        fontSize: '15px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        boxShadow: loading ? 'none' : '0 2px 8px rgba(13,159,99,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
        transition: 'opacity 0.15s, box-shadow 0.15s',
        marginTop: '4px',
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget.style.opacity = '0.9') }}
      onMouseLeave={e => { (e.currentTarget.style.opacity = '1') }}
    >
      {loading ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.7s linear infinite' }} aria-hidden>
            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
            <path d="M14 8a6 6 0 00-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Ingresando...
        </>
      ) : (
        <>
          Entrar a mi cuenta
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9.5 4.5L13 8l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </>
      )}
    </button>
  )
}

/* ── Input inline style ── */
function fieldStyle(hasError: boolean): CSSProperties {
  return {
    width: '100%', height: '52px',
    paddingLeft: '44px', paddingRight: '14px',
    fontFamily: 'Inter, sans-serif', fontSize: '14px',
    color: '#0B1812',
    background: '#FFFFFF',
    border: `1.5px solid ${hasError ? '#FCA5A5' : '#DDE5DF'}`,
    borderRadius: '11px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  }
}
