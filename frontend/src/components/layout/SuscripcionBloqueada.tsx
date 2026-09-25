import { useAuthStore } from '../../stores/authStore'

/**
 * Pantalla que reemplaza a la aplicación cuando la suscripción venció o está
 * suspendida.
 *
 * Se muestra en vez de dejar que cada pantalla falle por su cuenta: con el
 * API respondiendo 402 a todo, el usuario vería una sucesión de errores sin
 * entender el motivo.
 */
export function SuscripcionBloqueada() {
  const { suscripcion, user, logout } = useAuthStore()
  const suspendida = suscripcion?.estado === 'Suspendida'

  const vencimiento = suscripcion?.hasta
    ? new Date(`${suscripcion.hasta}T00:00:00`).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-md rounded-2xl bg-surface p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-50">
          <span className="text-2xl">{suspendida ? '🔒' : '⏳'}</span>
        </div>

        <h1 className="text-xl font-bold text-text-primary">
          {suspendida ? 'Cuenta suspendida' : 'Tu suscripción venció'}
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-text-secondary">
          {suspendida
            ? 'Tu acceso está pausado. Escribinos para reactivarlo.'
            : vencimiento
              ? `Tu acceso llegó hasta el ${vencimiento}. Renovalo para seguir trabajando.`
              : 'Renovala para seguir usando NutriSoftware.'}
        </p>

        <div className="mt-6 rounded-xl bg-canvas px-4 py-3 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Para renovar
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            Escribinos a <strong>soporte@nutrisoftware.com</strong> indicando tu
            correo <strong>{user?.email}</strong> y te reactivamos la cuenta.
          </p>
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-text-tertiary">
          Tus datos siguen guardados. Al renovar vas a encontrar todo como lo dejaste.
        </p>

        <button
          onClick={logout}
          className="mt-6 text-[13px] font-semibold text-primary-600 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
