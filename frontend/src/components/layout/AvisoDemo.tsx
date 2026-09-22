/* ────────────────────────────────────────────────────────────────
   AVISO DE DEMOSTRACIÓN

   Se activa con VITE_MODO_DEMO=true (se define en Netlify, no en el
   .env local), así que en desarrollo no estorba.

   No es decorativo: la base de la demo es pública de hecho —cualquiera
   que entre con la cuenta demo ve y edita lo que haya— y los Z-scores
   infantiles todavía salen de una tabla OMS interpolada. Quien abra el
   link tiene que saber las dos cosas antes de cargar nada.
   ──────────────────────────────────────────────────────────────── */

import type { CSSProperties } from 'react'

export const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === 'true'

/** Banner fino que acompaña a toda la app una vez iniciada la sesión. */
export function AvisoDemo() {
  if (!MODO_DEMO) return null

  return (
    <div
      role="note"
      className="flex-shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <p className="text-xs leading-relaxed text-amber-900">
        <strong>Versión de demostración.</strong> Los datos son ficticios, se comparten entre
        todos los visitantes y se reinician periódicamente: no cargues información de pacientes
        reales. Las curvas OMS usan una tabla de referencia abreviada, así que{' '}
        <strong>no aptas para uso clínico</strong>.
      </p>
    </div>
  )
}

/**
 * Tarjeta con las credenciales, para que quien llegue al link pueda entrar.
 * Va con estilos inline porque LoginPage está escrita así de punta a punta.
 */
export function CredencialesDemo() {
  if (!MODO_DEMO) return null

  const fila: CSSProperties = { display: 'flex', gap: '8px' }
  const etiqueta: CSSProperties = { width: '80px', color: '#0D9F63' }
  const valor: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }

  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid #A7E8C8',
        background: '#F0FBF5',
        padding: '16px',
      }}
    >
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0A5C3B', margin: 0 }}>
        Cuenta de demostración
      </p>
      <dl style={{ margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#14663F' }}>
        <div style={fila}>
          <dt style={etiqueta}>Correo</dt>
          <dd style={{ ...valor, margin: 0 }}>demo@nutrisoftware.com</dd>
        </div>
        <div style={fila}>
          <dt style={etiqueta}>Contraseña</dt>
          <dd style={{ ...valor, margin: 0 }}>Nutri2026</dd>
        </div>
      </dl>
    </div>
  )
}
