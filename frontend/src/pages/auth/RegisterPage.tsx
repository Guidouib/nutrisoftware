import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/ui/Input'
import { api } from '../../services/api'

/* ── Schema ── */
const schema = z.object({
  nombres:   z.string().min(2, 'Ingresa tu nombre'),
  apellidos: z.string().min(2, 'Ingresa tus apellidos'),
  email:     z.string().email('Correo inválido'),
  password:  z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
    .regex(/\d/, 'Incluye al menos un número'),
  confirmar: z.string(),
}).refine(d => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
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
  { label: 'Hasta 25 pacientes activos',   icon: <IcoCheck /> },
  { label: 'Evaluaciones ISAK completas',  icon: <IcoCheck /> },
  { label: 'Generación de dietas con IA',  icon: <IcoCheck /> },
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
    label: 'Sin tarjeta',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <rect x="1" y="3" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M1 5.5h10" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M3 7.5h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Gratis siempre',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M4 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

/* ── Password strength ── */
function PwdStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['#F87171', '#FB923C', '#A3E635', '#22C55E']
  const labels = ['Muy débil', 'Débil', 'Buena', 'Fuerte']

  if (!password) return null
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              height: '3px', flex: 1, borderRadius: '99px',
              background: i < score ? colors[score - 1] : '#DDE5DF',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '11px', color: '#7A9882', margin: 0 }}>{labels[score - 1] ?? ''}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════ */
export default function RegisterPage() {
  const [showPwd, setShowPwd]         = useState(false)
  const [serverError, setServerError] = useState('')
  const [pwdVal, setPwdVal]           = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const pwdWatch = watch('password', '')

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await api.post('/auth/register', {
        nombres:   data.nombres,
        apellidos: data.apellidos,
        email:     data.email,
        password:  data.password,
      })
      navigate('/login?registered=1')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setServerError(err.response?.data?.message ?? 'Error al crear la cuenta')
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
        aria-label="NutriSoftware — Beneficios del plan gratuito"
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
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
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
          </Link>

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
                Gratis · Sin tarjeta de crédito · Lista en 2 minutos
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 style={{
                fontSize: 'clamp(30px, 3.2vw, 42px)',
                fontWeight: 800, lineHeight: 1.08,
                letterSpacing: '-0.8px', margin: 0,
              }}>
                <span style={{ color: '#FFFFFF', display: 'block' }}>Empieza a gestionar</span>
                <span style={{ color: '#22C55E', display: 'block' }}>tu consulta hoy</span>
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.48)', fontSize: '14px',
                lineHeight: 1.65, maxWidth: '360px', margin: '14px 0 0',
              }}>
                Tu plan gratuito incluye todo lo que necesitas para arrancar tu consulta de nutrición de forma profesional.
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
                  Me registré y en 10 minutos ya tenía mi primer paciente cargado y su plan alimentario listo. Increíble para una herramienta gratuita.
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
                    CP
                  </div>
                  <div>
                    <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600, margin: 0, lineHeight: 1.2 }}>
                      Lic. Carla Pereyra
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: '2px 0 0', lineHeight: 1 }}>
                      Nutricionista · Buenos Aires
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
                +2,400 nutricionistas ya registrados
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
          overflowY: 'auto',
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
                Crea tu cuenta gratuita
              </h2>
              <p style={{ fontSize: '14px', color: '#7A9882', margin: 0 }}>
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  style={{ color: '#0D9F63', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Inicia sesión
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Nombres"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Juan Pablo"
                  error={errors.nombres?.message}
                  required
                  inputSize="lg"
                  {...register('nombres')}
                  leftIcon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                      <circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  }
                />
                <Input
                  label="Apellidos"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Pérez García"
                  error={errors.apellidos?.message}
                  required
                  inputSize="lg"
                  {...register('apellidos')}
                  leftIcon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                      <circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  }
                />
              </div>

              <Input
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                error={errors.email?.message}
                required
                inputSize="lg"
                {...register('email')}
                leftIcon={
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                    <rect x="1.5" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M1.5 4.5l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                }
              />

              <div>
                <Input
                  label="Contraseña"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  error={errors.password?.message}
                  required
                  inputSize="lg"
                  {...register('password', {
                    onChange: e => setPwdVal(e.target.value),
                  })}
                  leftIcon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                      <rect x="3" y="6.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M5 6.5V5a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
                    </svg>
                  }
                  rightIcon={
                    showPwd ? (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                        <path d="M13 7.5C11 10 9.2 11 7.5 11S4 10 2 7.5C4 5 5.8 4 7.5 4S11 5 13 7.5z" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
                        <path d="M2 2l11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                        <path d="M13 7.5C11 10 9.2 11 7.5 11S4 10 2 7.5C4 5 5.8 4 7.5 4S11 5 13 7.5z" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
                      </svg>
                    )
                  }
                  onRightIconClick={() => setShowPwd(v => !v)}
                />
                <PwdStrength password={pwdVal || pwdWatch} />
              </div>

              <Input
                label="Confirmar contraseña"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                error={errors.confirmar?.message}
                required
                inputSize="lg"
                {...register('confirmar')}
                leftIcon={
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                    <path d="M5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="1.5" y="1.5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                }
              />

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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  height: '52px', width: '100%', borderRadius: '12px',
                  background: isSubmitting ? 'rgba(13,159,99,0.65)' : 'linear-gradient(135deg, #10A868 0%, #0B8555 100%)',
                  color: '#FFFFFF',
                  fontSize: '15px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: isSubmitting ? 'none' : '0 2px 8px rgba(13,159,99,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                  transition: 'opacity 0.15s, box-shadow 0.15s',
                  marginTop: '4px',
                }}
                onMouseEnter={e => { if (!isSubmitting) (e.currentTarget.style.opacity = '0.9') }}
                onMouseLeave={e => { (e.currentTarget.style.opacity = '1') }}
              >
                {isSubmitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.7s linear infinite' }} aria-hidden>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
                      <path d="M14 8a6 6 0 00-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta gratis
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8h10M9.5 4.5L13 8l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
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

          {/* Terms */}
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#A8BCAE', marginTop: '16px', lineHeight: 1.6 }}>
            Al registrarte aceptas los{' '}
            <a href="#" style={{ color: '#7A9882', textDecoration: 'underline' }}>Términos de uso</a>
            {' '}y la{' '}
            <a href="#" style={{ color: '#7A9882', textDecoration: 'underline' }}>Política de privacidad</a>
          </p>
        </div>
      </section>
    </div>
  )
}
