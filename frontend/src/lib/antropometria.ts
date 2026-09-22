import type {
  MedidasISAK,
  NivelISAK,
  ResultadoAntropometria,
  Sexo,
  Somatotipo,
} from '../types/evaluacion'
import type { NivelSemaforo } from './semaforo'

/* ═══════════════════════════════════════════════════════════════
   CATÁLOGO DE CAMPOS ISAK

   El formulario se renderiza a partir de esta tabla: cada nivel
   muestra sus campos MÁS los de todos los niveles anteriores
   (perfil acumulativo). Así los 4 niveles comparten un único
   formulario y un único esquema de validación generado.
   ═══════════════════════════════════════════════════════════════ */

export type GrupoISAK = 'basico' | 'pliegues' | 'perimetros' | 'diametros' | 'longitudes'

export interface CampoISAK {
  id: string
  label: string
  unidad: 'kg' | 'cm' | 'mm'
  grupo: GrupoISAK
  nivel: NivelISAK
  /** Máximo plausible; corta errores de tipeo (ej. 1700 mm de pliegue). */
  max: number
}

export const GRUPOS_ISAK: { id: GrupoISAK; titulo: string; descripcion: string }[] = [
  { id: 'basico',     titulo: 'Medidas básicas',      descripcion: 'Masa corporal y estatura' },
  { id: 'pliegues',   titulo: 'Pliegues cutáneos',    descripcion: 'Plicómetro, en milímetros' },
  { id: 'perimetros', titulo: 'Perímetros',           descripcion: 'Cinta antropométrica, en centímetros' },
  { id: 'diametros',  titulo: 'Diámetros óseos',      descripcion: 'Paquímetro, en centímetros' },
  { id: 'longitudes', titulo: 'Longitudes y alturas', descripcion: 'Segmentos corporales, en centímetros' },
]

export const CAMPOS_ISAK: CampoISAK[] = [
  /* ── Nivel 1 — perfil restringido ── */
  { id: 'peso',                 label: 'Peso corporal',               unidad: 'kg', grupo: 'basico',     nivel: 1, max: 400 },
  { id: 'talla',                label: 'Talla de pie',                unidad: 'cm', grupo: 'basico',     nivel: 1, max: 260 },
  { id: 'pliegueTriceps',       label: 'Tríceps',                     unidad: 'mm', grupo: 'pliegues',   nivel: 1, max: 80 },
  { id: 'pliegueSubescapular',  label: 'Subescapular',                unidad: 'mm', grupo: 'pliegues',   nivel: 1, max: 80 },
  { id: 'pliegueSupraespinal',  label: 'Supraespinal',                unidad: 'mm', grupo: 'pliegues',   nivel: 1, max: 80 },
  { id: 'plieguePantorrilla',   label: 'Pantorrilla medial',          unidad: 'mm', grupo: 'pliegues',   nivel: 1, max: 80 },
  { id: 'perimetroBrazoFlex',   label: 'Brazo flexionado en tensión', unidad: 'cm', grupo: 'perimetros', nivel: 1, max: 70 },
  { id: 'perimetroPantorrilla', label: 'Pantorrilla máxima',          unidad: 'cm', grupo: 'perimetros', nivel: 1, max: 70 },
  { id: 'diametroHumero',       label: 'Húmero biepicondíleo',        unidad: 'cm', grupo: 'diametros',  nivel: 1, max: 12 },
  { id: 'diametroFemur',        label: 'Fémur biepicondíleo',         unidad: 'cm', grupo: 'diametros',  nivel: 1, max: 14 },

  /* ── Nivel 2 — perfil completo ── */
  { id: 'pliegueBiceps',         label: 'Bíceps',            unidad: 'mm', grupo: 'pliegues',   nivel: 2, max: 80 },
  { id: 'pliegueIliocrestal',    label: 'Cresta ilíaca',     unidad: 'mm', grupo: 'pliegues',   nivel: 2, max: 80 },
  { id: 'pliegueAbdominal',      label: 'Abdominal',         unidad: 'mm', grupo: 'pliegues',   nivel: 2, max: 80 },
  { id: 'pliegueMuslo',          label: 'Muslo anterior',    unidad: 'mm', grupo: 'pliegues',   nivel: 2, max: 80 },
  { id: 'perimetroCintura',      label: 'Cintura mínima',    unidad: 'cm', grupo: 'perimetros', nivel: 2, max: 200 },
  { id: 'perimetroCadera',       label: 'Cadera máxima',     unidad: 'cm', grupo: 'perimetros', nivel: 2, max: 200 },
  { id: 'perimetroBrazoRelaj',   label: 'Brazo relajado',    unidad: 'cm', grupo: 'perimetros', nivel: 2, max: 70 },
  { id: 'diametroBiacromial',    label: 'Biacromial',        unidad: 'cm', grupo: 'diametros',  nivel: 2, max: 60 },
  { id: 'diametroBiileocrestal', label: 'Biileocrestal',     unidad: 'cm', grupo: 'diametros',  nivel: 2, max: 50 },

  /* ── Nivel 3 — perfil ampliado ── */
  { id: 'tallaSentado',         label: 'Talla sentado',         unidad: 'cm', grupo: 'longitudes', nivel: 3, max: 150 },
  { id: 'envergadura',          label: 'Envergadura de brazos', unidad: 'cm', grupo: 'longitudes', nivel: 3, max: 260 },
  { id: 'perimetroTorax',       label: 'Tórax mesoesternal',    unidad: 'cm', grupo: 'perimetros', nivel: 3, max: 200 },
  { id: 'perimetroAntebrazo',   label: 'Antebrazo máximo',      unidad: 'cm', grupo: 'perimetros', nivel: 3, max: 50 },
  { id: 'perimetroMuslo',       label: 'Muslo medio',           unidad: 'cm', grupo: 'perimetros', nivel: 3, max: 100 },
  { id: 'diametroToraxTransv',  label: 'Tórax transverso',      unidad: 'cm', grupo: 'diametros',  nivel: 3, max: 45 },
  { id: 'diametroToraxAnteroP', label: 'Tórax anteroposterior', unidad: 'cm', grupo: 'diametros',  nivel: 3, max: 40 },

  /* ── Nivel 4 — perfil con longitudes segmentarias ── */
  { id: 'longAcromialRadial',   label: 'Acromial – radial',     unidad: 'cm', grupo: 'longitudes', nivel: 4, max: 60 },
  { id: 'longRadialEstiloidea', label: 'Radial – estiloidea',   unidad: 'cm', grupo: 'longitudes', nivel: 4, max: 50 },
  { id: 'longIliospinal',       label: 'Altura iliospinal',     unidad: 'cm', grupo: 'longitudes', nivel: 4, max: 150 },
  { id: 'longTrocanterea',      label: 'Altura trocantérea',    unidad: 'cm', grupo: 'longitudes', nivel: 4, max: 150 },
  { id: 'longTibialLateral',    label: 'Altura tibial lateral', unidad: 'cm', grupo: 'longitudes', nivel: 4, max: 90 },
  { id: 'perimetroMuneca',      label: 'Muñeca mínima',         unidad: 'cm', grupo: 'perimetros', nivel: 4, max: 30 },
  { id: 'perimetroTobillo',     label: 'Tobillo mínimo',        unidad: 'cm', grupo: 'perimetros', nivel: 4, max: 40 },
]

/** Campos visibles en un nivel: los propios más los de niveles anteriores. */
export function camposDeNivel(nivel: NivelISAK): CampoISAK[] {
  return CAMPOS_ISAK.filter(c => c.nivel <= nivel)
}

export const NIVELES_ISAK: { valor: NivelISAK; titulo: string; detalle: string }[] = [
  { valor: 1, titulo: 'Nivel 1', detalle: 'Perfil restringido' },
  { valor: 2, titulo: 'Nivel 2', detalle: 'Perfil completo' },
  { valor: 3, titulo: 'Nivel 3', detalle: 'Perfil ampliado' },
  { valor: 4, titulo: 'Nivel 4', detalle: 'Perfil con longitudes' },
]

/* ═══════════════════════════════════════════════════════════════
   CÁLCULOS
   ═══════════════════════════════════════════════════════════════ */

function redondear(n: number, decimales = 1): number {
  const f = 10 ** decimales
  return Math.round(n * f) / f
}

/** Devuelve el número solo si es finito y positivo. */
function num(v: number | undefined): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null
}

/** IMC = peso (kg) / talla (m)². */
export function calcularImc(pesoKg: number | null, tallaCm: number | null): number | null {
  if (pesoKg === null || tallaCm === null) return null
  const m = tallaCm / 100
  return redondear(pesoKg / (m * m), 1)
}

/** Clasificación OMS de IMC en adultos. */
export function clasificarImc(imc: number | null): string | null {
  if (imc === null) return null
  if (imc < 16) return 'Delgadez severa'
  if (imc < 17) return 'Delgadez moderada'
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidad grado I'
  if (imc < 40) return 'Obesidad grado II'
  return 'Obesidad grado III'
}

/** Semáforo del diagnóstico por IMC. */
export function nivelPorImc(imc: number | null): NivelSemaforo {
  if (imc === null) return 'neutro'
  if (imc >= 18.5 && imc < 25) return 'optimo'
  if ((imc >= 17 && imc < 18.5) || (imc >= 25 && imc < 30)) return 'precaucion'
  return 'critico'
}

/** Ecuación de Siri (1961): densidad corporal → % de grasa. */
function siri(densidad: number): number {
  return 495 / densidad - 450
}

/* ── Durnin & Womersley (1974) — 4 pliegues ───────────────────── */

function coefDurnin(sexo: Sexo, edad: number): { c: number; m: number } {
  if (sexo === 'M') {
    if (edad < 20) return { c: 1.1620, m: 0.0630 }
    if (edad < 30) return { c: 1.1631, m: 0.0632 }
    if (edad < 40) return { c: 1.1422, m: 0.0544 }
    if (edad < 50) return { c: 1.1620, m: 0.0700 }
    return { c: 1.1715, m: 0.0779 }
  }
  if (edad < 20) return { c: 1.1549, m: 0.0678 }
  if (edad < 30) return { c: 1.1599, m: 0.0717 }
  if (edad < 40) return { c: 1.1423, m: 0.0632 }
  if (edad < 50) return { c: 1.1333, m: 0.0612 }
  return { c: 1.1339, m: 0.0645 }
}

/**
 * % de grasa por Durnin & Womersley: bíceps + tríceps + subescapular + cresta ilíaca.
 * Devuelve `null` si falta alguno de los 4 (el nivel 1 no los incluye todos).
 */
export function grasaDurninWomersley(m: MedidasISAK, sexo: Sexo, edad: number): number | null {
  const biceps = num(m.pliegueBiceps)
  const triceps = num(m.pliegueTriceps)
  const subesc = num(m.pliegueSubescapular)
  const iliaco = num(m.pliegueIliocrestal)
  if (biceps === null || triceps === null || subesc === null || iliaco === null) return null

  const suma = biceps + triceps + subesc + iliaco
  const { c, m: pendiente } = coefDurnin(sexo, edad)
  const densidad = c - pendiente * Math.log10(suma)
  if (densidad <= 0) return null
  return redondear(siri(densidad), 1)
}

/* ── Jackson & Pollock — 3 pliegues ───────────────────────────── */

/**
 * % de grasa por Jackson & Pollock de 3 pliegues.
 * Hombres: el pectoral de la ecuación original no forma parte del perfil ISAK,
 * por lo que se usa el subescapular — sustitución habitual al trabajar con ISAK.
 * Mujeres: tríceps, suprailíaco y muslo, tal como la ecuación original.
 */
export function grasaJacksonPollock(m: MedidasISAK, sexo: Sexo, edad: number): number | null {
  const muslo = num(m.pliegueMuslo)
  if (muslo === null) return null

  let densidad: number

  if (sexo === 'M') {
    const subesc = num(m.pliegueSubescapular)
    const abdominal = num(m.pliegueAbdominal)
    if (subesc === null || abdominal === null) return null
    const suma = subesc + abdominal + muslo
    densidad = 1.10938 - 0.0008267 * suma + 0.0000016 * suma * suma - 0.0002574 * edad
  } else {
    const triceps = num(m.pliegueTriceps)
    const supra = num(m.pliegueSupraespinal)
    if (triceps === null || supra === null) return null
    const suma = triceps + supra + muslo
    densidad = 1.0994921 - 0.0009929 * suma + 0.0000023 * suma * suma - 0.0001392 * edad
  }

  if (densidad <= 0) return null
  return redondear(siri(densidad), 1)
}

/* ── Somatotipo Heath-Carter ──────────────────────────────────── */

function categoriaSomatotipo(en: number, me: number, ec: number): string {
  const dom = Math.max(en, me, ec)
  const parejo = (a: number, b: number) => Math.abs(a - b) <= 0.5

  if (parejo(en, me) && parejo(me, ec)) return 'Central'
  if (dom === en) return parejo(me, ec) ? 'Endomorfo balanceado' : me > ec ? 'Endo-mesomorfo' : 'Endo-ectomorfo'
  if (dom === me) return parejo(en, ec) ? 'Mesomorfo balanceado' : en > ec ? 'Meso-endomorfo' : 'Meso-ectomorfo'
  return parejo(en, me) ? 'Ectomorfo balanceado' : en > me ? 'Ecto-endomorfo' : 'Ecto-mesomorfo'
}

/**
 * Somatotipo antropométrico de Heath-Carter.
 * Requiere el bloque completo de nivel 1 (pliegues + diámetros + perímetros).
 */
export function calcularSomatotipo(m: MedidasISAK): Somatotipo | null {
  const peso = num(m.peso)
  const talla = num(m.talla)
  const triceps = num(m.pliegueTriceps)
  const subesc = num(m.pliegueSubescapular)
  const supra = num(m.pliegueSupraespinal)
  const plPantorrilla = num(m.plieguePantorrilla)
  const humero = num(m.diametroHumero)
  const femur = num(m.diametroFemur)
  const brazoFlex = num(m.perimetroBrazoFlex)
  const perPantorrilla = num(m.perimetroPantorrilla)

  if (
    peso === null || talla === null || triceps === null || subesc === null ||
    supra === null || plPantorrilla === null || humero === null || femur === null ||
    brazoFlex === null || perPantorrilla === null
  ) {
    return null
  }

  // Endomorfia — suma de 3 pliegues corregida por talla a 170.18 cm.
  const x = (triceps + subesc + supra) * (170.18 / talla)
  const endomorfia = Math.max(0.1, -0.7182 + 0.1451 * x - 0.00068 * x ** 2 + 0.0000014 * x ** 3)

  // Mesomorfia — perímetros corregidos restando el pliegue del sitio (mm → cm).
  const brazoCorr = brazoFlex - triceps / 10
  const pantorrillaCorr = perPantorrilla - plPantorrilla / 10
  const mesomorfia = Math.max(
    0.1,
    0.858 * humero + 0.601 * femur + 0.188 * brazoCorr + 0.161 * pantorrillaCorr - 0.131 * talla + 4.5
  )

  // Ectomorfia — a partir del índice ponderal recíproco (HWR).
  const hwr = talla / Math.cbrt(peso)
  let ectomorfia: number
  if (hwr >= 40.75) ectomorfia = 0.732 * hwr - 28.58
  else if (hwr >= 38.25) ectomorfia = 0.463 * hwr - 17.63
  else ectomorfia = 0.1
  ectomorfia = Math.max(0.1, ectomorfia)

  const endo = redondear(endomorfia, 1)
  const meso = redondear(mesomorfia, 1)
  const ecto = redondear(ectomorfia, 1)

  return {
    endomorfia: endo,
    mesomorfia: meso,
    ectomorfia: ecto,
    x: redondear(ecto - endo, 2),
    y: redondear(2 * meso - (endo + ecto), 2),
    categoria: categoriaSomatotipo(endo, meso, ecto),
  }
}

/** Índice cintura-cadera. Riesgo elevado: > 0.95 en hombres, > 0.85 en mujeres (OMS). */
export function calcularIcc(m: MedidasISAK): number | null {
  const cintura = num(m.perimetroCintura)
  const cadera = num(m.perimetroCadera)
  if (cintura === null || cadera === null) return null
  return redondear(cintura / cadera, 2)
}

export function nivelPorIcc(icc: number | null, sexo: Sexo): NivelSemaforo {
  if (icc === null) return 'neutro'
  const limite = sexo === 'M' ? 0.95 : 0.85
  if (icc < limite - 0.05) return 'optimo'
  if (icc <= limite) return 'precaucion'
  return 'critico'
}

/** Calcula todos los derivados de una toma antropométrica. */
export function evaluarAntropometria(m: MedidasISAK, sexo: Sexo, edad: number): ResultadoAntropometria {
  const peso = num(m.peso)
  const talla = num(m.talla)
  const imc = calcularImc(peso, talla)

  const dw = grasaDurninWomersley(m, sexo, edad)
  const jp = dw === null ? grasaJacksonPollock(m, sexo, edad) : null
  const porcentajeGrasa = dw ?? jp
  const metodoGrasa =
    dw !== null ? 'Durnin & Womersley (4 pliegues)'
    : jp !== null ? 'Jackson & Pollock (3 pliegues)'
    : null

  const masaGrasaKg =
    peso !== null && porcentajeGrasa !== null ? redondear((peso * porcentajeGrasa) / 100, 1) : null

  return {
    imc,
    clasificacionImc: clasificarImc(imc),
    porcentajeGrasa,
    metodoGrasa,
    masaGrasaKg,
    masaLibreGrasaKg: peso !== null && masaGrasaKg !== null ? redondear(peso - masaGrasaKg, 1) : null,
    indiceCinturaCadera: calcularIcc(m),
    somatotipo: calcularSomatotipo(m),
  }
}

/* ── Edad ─────────────────────────────────────────────────────── */

/** Edad en años cumplidos a partir de una fecha ISO de nacimiento. */
export function edadEnAnios(fechaNacimiento: string): number {
  const nac = new Date(fechaNacimiento)
  if (Number.isNaN(nac.getTime())) return 0
  const hoy = new Date()
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return Math.max(0, edad)
}

/** Edad en meses — necesaria para Z-scores OMS y percentiles CDC. */
export function edadEnMeses(fechaNacimiento: string): number {
  const nac = new Date(fechaNacimiento)
  if (Number.isNaN(nac.getTime())) return 0
  const hoy = new Date()
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth())
  if (hoy.getDate() < nac.getDate()) meses--
  return Math.max(0, meses)
}
