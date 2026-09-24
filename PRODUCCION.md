# Pasar NutriSoftware a producción

Guía para dejar de ser una demo y empezar a atender pacientes reales.
Para el despliegue inicial ver [DEPLOY.md](DEPLOY.md).

> **Antes de cargar el primer paciente real**, repasá la sección
> [Lo que no depende del código](#lo-que-no-depende-del-código). Son datos de
> salud y hay obligaciones legales que ningún cambio técnico resuelve.

---

## 1 · Variables de entorno

### Render — el API

| Variable | Demo | **Producción** |
|---|---|---|
| `SembrarDatosDemo` | `true` | **`false`** |
| `HabilitarSwagger` | `true` | **`false`** |
| `PermitirRegistroPublico` | `true` | **`false`** si las cuentas las creás vos |
| `AllowedOrigins` | — | tu dominio real |
| `Jwt__Secret` | — | sin cambios |
| `DATABASE_URL` | — | la de Neon |

`SembrarDatosDemo=false` deja de crear la cuenta `demo@nutrisoftware.com` y
los pacientes ficticios. **No borra los que ya existen**: eso va en el paso 2.

`PermitirRegistroPublico=false` cierra el alta. Sin esto, cualquiera que
llegue a la URL se crea una cuenta en la misma base donde están tus pacientes.
Sus datos quedarían aislados —el filtrado por nutricionista está bien hecho—
pero no querés desconocidos ahí adentro.

### Netlify — el frontend

| Variable | Demo | **Producción** |
|---|---|---|
| `VITE_MODO_DEMO` | `true` | **`false`** |

Apaga el banner de «versión de demostración» y la tarjeta con las credenciales
públicas en el login. **Requiere volver a desplegar**: Vite sustituye esa
variable al compilar, no en tiempo de ejecución.

---

## 2 · Borrar los datos de demostración

Desde el SQL Editor de Neon, **después** de poner `SembrarDatosDemo=false`
(si no, el próximo arranque los vuelve a crear):

```sql
-- Se lleva pacientes, evaluaciones, dietas, seguimientos y recordatorios
-- de la cuenta demo por las FK en cascada.
DELETE FROM "Usuarios" WHERE "Email" = 'demo@nutrisoftware.com';
```

Los 1.895 alimentos **no se tocan**: son el catálogo, no datos de demo.

Verificá:

```sql
SELECT "Email" FROM "Usuarios";
SELECT count(*) FROM "Pacientes";
```

---

## 3 · Respaldos

**El plan gratuito de Neon no incluye respaldos.** Con historias clínicas
adentro eso no es defendible. Dos caminos:

**a) Neon pago** (~19 USD/mes) — recuperación a cualquier instante, sin
trabajo de tu parte. Es lo que recomiendo.

**b) Volcados locales** — gratis, con el script incluido:

```powershell
$env:NUTRISOFTWARE_DB = "postgresql://...la cadena de Neon..."
.\scripts\respaldar-bd.ps1
```

Programalo en el Programador de tareas de Windows para que corra a diario.
Y **copiá los archivos fuera de tu máquina** (Drive, OneDrive, disco externo):
un respaldo en el mismo disco que puede fallar no protege de mucho.

> Los `.dump` contienen historias clínicas. Ya están fuera del repositorio,
> pero guardalos en un lugar con control de acceso.

---

## 4 · Que el servicio no se duerma

El plan gratuito de Render apaga el API a los 15 minutos sin tráfico y tarda
cerca de un minuto en volver. Para producción:

- **Render Starter** (~7 USD/mes), o
- **UptimeRobot** gratis pegándole a `/health` cada 10 minutos — entra en las
  750 horas mensuales del plan libre, pero solo con un servicio.

---

## Qué ya está resuelto

| | |
|---|---|
| **Sesión** | El access token dura 15 min y se renueva solo contra `/api/auth/refresh`. El token usado se revoca y se entrega otro, así uno robado deja de servir. |
| **Contraseñas** | Validadas en el servidor: 8+ caracteres, una mayúscula, un número. Antes la regla vivía solo en el navegador y el API aceptaba cualquier cosa. |
| **Fuerza bruta** | 10 intentos por minuto y por IP sobre `/api/auth`. El resto del API no está limitado. |
| **Aislamiento** | Los 9 repositorios filtran por nutricionista a través del paciente. Nadie ve pacientes ajenos. |
| **Migraciones** | Se aplican solas al desplegar. |

---

## Lo que no depende del código

### ⚖️ Legal

Son **datos sensibles** según la Ley 29733 de Protección de Datos Personales:

- **Consentimiento expreso e informado** del paciente, por escrito, antes de
  cargar nada
- **Inscripción del banco de datos ante la ANPD**
- **Términos de uso y Política de privacidad** — hoy los enlaces del registro
  no llevan a ningún lado; hace falta texto real
- Un procedimiento para cuando el paciente pida acceso, rectificación o baja

### ⚠️ Clínico

**Las curvas OMS usan una tabla de referencia abreviada.** Los Z-scores de
niños y adolescentes salen de puntos ancla interpolados, no de las tablas
oficiales mes a mes, y pueden dar un diagnóstico equivocado de desnutrición o
sobrepeso.

**No uses el módulo pediátrico con pacientes reales** hasta reemplazar el
contenido de `TABLAS` en `frontend/src/lib/oms.ts` por los archivos de
[who.int](https://www.who.int/tools/child-growth-standards/standards) y poner
`REFERENCIA_ABREVIADA = false`.

Con adultos no hay problema: antropometría, bioquímica, clínica, dietas,
seguimiento y consumo trabajan sobre datos correctos.

### 📧 Recuperación de contraseña

No hay envío de correo, así que el enlace del login explica que hay que
escribir a soporte. Si vas a tener varios usuarios, conviene resolverlo:
`/api/reportes/{id}/enviar` también responde 501 por lo mismo.

---

## Lista de verificación

```
[ ] SembrarDatosDemo=false en Render
[ ] HabilitarSwagger=false en Render
[ ] PermitirRegistroPublico=false en Render  (si cerrás el alta)
[ ] AllowedOrigins con el dominio real
[ ] VITE_MODO_DEMO=false en Netlify + volver a desplegar
[ ] Borrar la cuenta demo de la base
[ ] Respaldos andando (Neon pago o script programado)
[ ] Render Starter o UptimeRobot
[ ] Consentimiento del paciente firmado
[ ] Términos y política de privacidad redactados
[ ] Banco de datos inscrito ante la ANPD
[ ] Tablas OMS oficiales  (solo si vas a atender niños)
```
