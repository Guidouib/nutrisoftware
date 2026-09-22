# Desplegar la demo de NutriSoftware

Tres servicios gratuitos: **Neon** (Postgres), **Koyeb** (API .NET) y
**Netlify** (frontend). Sin tarjeta y sin dominio propio.

El orden importa: Neon primero porque Koyeb necesita su cadena de conexión,
y Netlify al final porque necesita la URL de Koyeb.

---

## 1 · Neon — base de datos

1. Nuevo proyecto → región cercana (`AWS us-east-2` sirve).
2. Copiá la **connection string** del panel. Tiene esta forma:

   ```
   postgresql://usuario:clave@ep-algo-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

No hace falta crear tablas ni correr migraciones a mano: el API aplica las
migraciones al arrancar y siembra los datos de la demo.

---

## 2 · Koyeb — API

**Create Service → GitHub →** repo `nutrisoftware`, rama `main`.

- **Builder:** Dockerfile (lo detecta solo; está en la raíz)
- **Puerto:** `8000`
- **Health check:** HTTP, path `/health`
- **Instance:** Free

### Variables de entorno

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la cadena de Neon del paso 1 |
| `Jwt__Secret` | un secreto propio de 32+ caracteres (ver abajo) |
| `Jwt__Issuer` | `NutriSoftware` |
| `Jwt__Audience` | `NutriSoftwareClients` |
| `SembrarDatosDemo` | `true` |
| `HabilitarSwagger` | `true` |
| `AllowedOrigins` | `https://TU-APP.netlify.app` |

Son **dos guiones bajos** en `Jwt__Secret`: así es como .NET mapea una
variable de entorno a la clave anidada `Jwt:Secret`.

> **El secreto es obligatorio.** El API se niega a arrancar fuera de
> Development si `Jwt__Secret` falta, y se niega en cualquier entorno si es
> el que estuvo expuesto en el historial público del repo. Generá uno nuevo:
>
> ```powershell
> $b = New-Object byte[] 48
> [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
> [Convert]::ToBase64String($b)
> ```

Cuando termine el deploy anotá la URL que te asigna: `algo-org.koyeb.app`.

Verificá que responde:

```bash
curl https://TU-APP-KOYEB.koyeb.app/health
# {"estado":"ok","fecha":"..."}
```

---

## 3 · Netlify — frontend

**Antes de conectar el repo**, editá `netlify.toml` y reemplazá
`TU-APP-KOYEB` por el subdominio real de Koyeb. Commiteá el cambio.

**Add new site → Import from GitHub →** repo `nutrisoftware`.

La configuración de build ya viene en `netlify.toml` (base `frontend`,
`npm run build`, publish `dist`). Solo agregá la variable de entorno:

| Variable | Valor |
|---|---|
| `VITE_MODO_DEMO` | `true` |

Eso enciende el aviso de demostración y la tarjeta con las credenciales en
la pantalla de login.

Después del primer deploy, volvé a Koyeb y poné la URL real de Netlify en
`AllowedOrigins`.

---

## Cómo entra el visitante

```
demo@nutrisoftware.com  /  Nutri2026
```

Las credenciales se muestran en la pantalla de login cuando
`VITE_MODO_DEMO=true`, así que no hay que explicárselas a nadie.

---

## Por qué no hay problemas de CORS

Netlify hace de proxy inverso: la regla de `netlify.toml` reenvía
`/api/*` a Koyeb del lado del servidor. El navegador solo ve el dominio de
Netlify, así que no hay petición cross-origin ni preflight. El frontend
sigue pidiendo a `/api` sin saber que el backend vive en otro lado.

`AllowedOrigins` queda igual como red de seguridad por si alguna vez le
pegás al API directo desde otro dominio.

---

## Límites de los planes gratuitos

| Servicio | Límite | Qué significa |
|---|---|---|
| Neon | 0.5 GB, compute duerme a los 5 min | La primera petición tras la siesta tarda ~1 s. El `EnableRetryOnFailure` del `DbContext` absorbe el corte. |
| Koyeb | 512 MB RAM, 0.1 vCPU, 1 instancia | No se duerme. El arranque en frío tras un deploy tarda ~30 s. |
| Netlify | 100 GB de tráfico al mes | De sobra para una demo. |

---

## Reiniciar los datos de la demo

La base es compartida: cualquiera que entre puede editar o borrar. Para
dejarla como nueva, borrá las tablas desde el SQL Editor de Neon y
reiniciá el servicio en Koyeb — las migraciones y el seed corren solos.

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

---

## Problemas frecuentes

**El API arranca y se cae en loop**
Mirá los logs de Koyeb. Casi siempre es `Jwt__Secret` sin definir (el
mensaje lo dice explícitamente) o la `DATABASE_URL` mal pegada.

**El frontend carga pero el login da 404 o falla la red**
`TU-APP-KOYEB` quedó sin reemplazar en `netlify.toml`, o el deploy de
Netlify es anterior al cambio. Redeployá.

**Los PDF fallan en producción pero andan en local**
QuestPDF renderiza con SkiaSharp, que enlaza contra `libfontconfig` y
`libfreetype`. El `Dockerfile` ya las instala; si tocás la imagen base,
no las saques.

---

## ⚠️ Antes de usarlo con pacientes reales

Esto es una demo, no un producto clínico:

1. **Tablas OMS** — `frontend/src/lib/oms.ts` usa puntos ancla
   interpolados, no las tablas oficiales mes a mes. Los Z-scores
   infantiles pueden dar diagnósticos equivocados. Hay que cargar los
   archivos de who.int y poner `REFERENCIA_ABREVIADA = false`.
2. **`SembrarDatosDemo=false`** y crear cuentas reales.
3. **Backups** — el plan gratuito de Neon no los incluye.

---

## Configuración local tras clonar

`appsettings.json` no lleva secretos: el repositorio es público. La cadena
de conexión y `Jwt:Secret` viven en `appsettings.Development.json`, que
está en `.gitignore`.

Al clonar en una máquina nueva, copiá la plantilla y completá los valores:

```bash
cd backend/src/NutriSoftware.API
cp appsettings.Development.example.json appsettings.Development.json
```

El secreto que estuvo expuesto en el historial está rechazado por código
en todos los entornos, así que no sirve ni para desarrollo.
