# NutriSoftware — UI Style Guide

Contrato de layout y estilos del frontend. Stack: React 19 + TypeScript + Vite 8 + **Tailwind CSS v4** (`@tailwindcss/vite`).

---

## 🔴 REGLA DE ORO — Todo el CSS propio va dentro de una `@layer`

```css
/* src/index.css */
@import "tailwindcss";

@theme { /* tokens */ }

@layer base {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; }
  body { font-family: var(--font-body); background: var(--color-canvas); }
  #root { min-height: 100vh; display: flex; flex-direction: column; }
}
```

### Por qué

`@import "tailwindcss"` declara en v4:

```css
@layer theme, base, components, utilities;
```

Toda utilidad (`p-6`, `m-6`, `pt-8`) se emite dentro de `@layer utilities`. La regla de CSS Cascade Layers dice que **el estilo sin capa gana sobre cualquier estilo en capa**, sin importar especificidad ni orden de aparición.

```
sin capa            ← * { padding: 0 }          ⟵ GANA SIEMPRE
  ↑
@layer utilities    ← .p-6 { padding: 1.5rem }
@layer components
@layer base
@layer theme
```

Un reset clásico `*, *::before, *::after { margin: 0; padding: 0 }` escrito **sin capa** anula **todos** los `p-*`, `m-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`, `mx-*`… del proyecto entero: layout y componentes.

### Síntoma con el que se detecta

Falla un subconjunto exacto de propiedades y el resto funciona:

| Utilidad | Estado |
|---|---|
| `gap-*`, `w-*`, `flex`, `bg-*`, `text-*`, `rounded-*` | ✅ funcionan |
| `p-*`, `m-*` (todas sus variantes) | ❌ muertas |

Cuando falla una lista específica de propiedades y no el resto, **no es un problema de build ni de breakpoints: es alguien pisando esas propiedades en la cascada.**

### Corolario de verificación

```bash
grep -o '\.p-6{[^}]*}' dist/assets/*.css   # prueba EMISIÓN, no EFECTO
```

Que la clase exista en el bundle **no prueba que gane la cascada**. Son cosas distintas.

> **Si una clase existe en el CSS compilado pero no tiene efecto visible → el problema es cascada, no compilación.**

Comprobar la estructura real del CSS emitido:

```bash
grep -o "@layer base{[^@]*box-sizing:border-box[^}]*}" dist/assets/*.css
# El "@layer base{" al inicio prueba que el reset dejó de estar sin capa.
```

Y medir el efecto en el navegador, no adivinar:

```js
const aside = document.querySelector('aside');
const main  = document.querySelector('main');
const a = aside.getBoundingClientRect(), m = main.getBoundingClientRect();
console.table({
  ancho_ventana:    window.innerWidth,
  sidebar_position: getComputedStyle(aside).position,
  CANAL_GRIS_px:    m.left - a.right,
  main_padding:     getComputedStyle(main).padding,
  padre_gap:        getComputedStyle(main.parentElement).gap,
});
```

---

## Estructura del layout

```tsx
// src/components/layout/AppLayout.tsx
<div className="flex w-full min-h-screen gap-6 bg-[#f8fafc]">   {/* gap-6 = canal izquierdo */}
  <Sidebar mobileOpen={mobileOpen} onMobileClose={…} />          {/* renderiza su propio <aside> */}

  <main className="flex min-h-screen min-w-0 flex-1 flex-col gap-6
                   overflow-y-auto pt-8 pr-6 pb-10 md:pr-8 md:pb-12">
    <header className="… lg:hidden">…</header>                   {/* barra móvil */}
    <Outlet />                                                   {/* layout route: NO usa children */}
  </main>
</div>
```

```tsx
// src/components/layout/Sidebar.tsx — <aside>
"fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-shrink-0 flex-col bg-[#0C120F] select-none
 transition-transform duration-200 ease-out
 lg:sticky lg:top-0 lg:bottom-auto lg:translate-x-0"
```

```tsx
// src/pages/dashboard/DashboardPage.tsx
<div className="flex w-full flex-1 flex-col gap-6">              {/* sin padding: lo pone <main> */}
  <header className="flex w-full flex-wrap items-start justify-between gap-4">…</header>

  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">  {/* 4 KPIs */}

  <div className="grid w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="flex flex-col gap-6 lg:col-span-2">          {/* Citas + Actividad */}
    <div className="flex flex-col gap-6 lg:col-span-1">          {/* Acciones + Módulos */}
  </div>
</div>
```

---

## Contratos

| Regla | Valor |
|---|---|
| Separación sidebar ↔ contenido | `gap-6` en el padre flex |
| **Nunca** `ml-64` / `pl-64` | El `<aside>` es `lg:sticky` = **en flujo**. Un margen de 256px duplicaría el desplazamiento |
| Perímetro (arriba/derecha/abajo) | Lo posee **`<main>`**, nunca las páginas |
| Páginas (`DashboardPage`, `PacientesPage`, …) | Sin `p-*`, sin `max-w-*`, sin `mx-auto` — solo `w-full` |
| `min-w-0` | Obligatorio en todo flex-item con contenido ancho (tablas, texto largo) |
| Tarjeta | `bg-white rounded-2xl border border-slate-100 shadow-sm` + `p-6` interno |
| Ítem activo sidebar | `bg-primary-500 text-white rounded-xl px-4 py-3 flex items-center gap-3` |
| Fondo de la app | `bg-[#f8fafc]` en el wrapper maestro |

### `fixed` vs `sticky` en la sidebar

```
< lg  →  fixed  + -translate-x-full   (drawer, fuera del flujo → gap-6 se ignora solo)
≥ lg  →  sticky + translate-x-0       (flex-item en flujo → gap-6 crea el canal)
```

`lg:bottom-auto` anula el `bottom: 0` heredado de `inset-y-0` del modo drawer.

---

## Tipografía

| Uso | Clases |
|---|---|
| H1 bienvenida | `text-3xl md:text-4xl font-bold text-slate-900 tracking-tight` |
| Número KPI | `text-4xl font-extrabold` — `text-slate-900`, o `text-slate-400` si el valor es `0` |
| Título de tarjeta / métrica | `text-base font-bold text-slate-800` |
| Texto secundario / leyendas | `text-xs md:text-sm text-slate-500 font-normal` |
| Título de estado vacío | `text-lg font-bold text-slate-800` |
| Labels de sección (sidebar) | `text-xs font-semibold uppercase tracking-wider text-slate-400` |
| Enlaces de nav | `text-sm font-medium` |

---

## Tokens de color — WCAG AA

Definidos en `@theme` de `src/index.css`. Ratios medidos sobre `#FFFFFF`:

| Token | Valor | Ratio | Uso |
|---|---|---|---|
| `--color-text-primary` | `#0B1812` | 18.9:1 | Títulos |
| `--color-text-secondary` | `#2F4A3A` | 9.3:1 | Párrafos densos |
| `--color-text-tertiary` | `#4F7361` | **4.6:1** | AA para 12–13px |
| `--color-text-muted` | `#6E8C7B` | 3.5:1 | Solo hints ≥14px |
| `--color-text-disabled` | `#9DB3A5` | — | **Decorativo únicamente** (chevrons, ghost bars). Nunca texto informativo |

Valores previos que **fallaban** AA y fueron reemplazados: `#7A9882` (3.0:1) y `#B4C8BB` (1.7:1).

---

## Checklist antes de dar por cerrado un cambio de estilos

1. `npx tsc -b --noEmit` → limpio (valida TS, **no** CSS).
2. `npx vite build` → sin errores (un override de cascada **no** es un error de build).
3. Medir con `getComputedStyle()` en el navegador — el único paso que prueba el efecto real.
4. Si el usuario reporta "no se aplicó" y HMR sí actualizó: descartar caché con DevTools → Network → *Disable cache* → F5, **y luego revisar cascada**.
