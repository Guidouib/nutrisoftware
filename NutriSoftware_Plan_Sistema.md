# 🥗 NutriSoftware — Plan Integral de Desarrollo

> **La herramienta integral para nutricionistas que quieren ahorrar tiempo y brindar un servicio 100% profesional.**

---

## 📑 Tabla de Contenidos

1. [Resumen Ejecutivo](#-1-resumen-ejecutivo)
2. [Descripción del Sistema](#-2-descripción-del-sistema)
3. [Fuentes de Información — Bases de Datos Nutricionales](#-3-fuentes-de-información--bases-de-datos-nutricionales)
4. [Decisión de Plataforma — Web vs Escritorio](#-4-decisión-de-plataforma--web-vs-escritorio)
5. [Arquitectura del Sistema](#-5-arquitectura-del-sistema)
6. [Stack Tecnológico](#-6-stack-tecnológico)
7. [Base de Datos](#-7-base-de-datos)
8. [Módulos del Sistema](#-8-módulos-del-sistema)
9. [Flujo General del Sistema](#-9-flujo-general-del-sistema)
10. [Roles de Usuario](#-10-roles-de-usuario)
11. [Diseño UI/UX](#-11-diseño-uiux)
12. [Seguridad y Cumplimiento](#-12-seguridad-y-cumplimiento)
13. [Arquitectura de Despliegue](#-13-arquitectura-de-despliegue)
14. [Cronograma de Desarrollo](#-14-cronograma-de-desarrollo)
15. [Modelo de Negocio](#-15-modelo-de-negocio)
16. [Análisis Financiero](#-16-análisis-financiero)
17. [Próximos Pasos](#-17-próximos-pasos)
18. [Conclusión](#-18-conclusión)

---

## 🎯 1. Resumen Ejecutivo

**NutriSoftware** es una aplicación web profesional diseñada exclusivamente para nutricionistas que buscan centralizar toda su práctica clínica en una sola herramienta. Elimina el uso de hojas de cálculo, papeles y múltiples programas separados, ofreciendo un entorno moderno, accesible desde cualquier dispositivo y completamente personalizable.

### Características clave

- ✅ Gestiona pacientes y citas de manera organizada y visual
- ✅ Calcula nutrientes automáticamente a partir de bases de datos reconocidas (TPCA, SMAE, USDA)
- ✅ Realiza evaluaciones nutricionales especializadas con diagnósticos automáticos
- ✅ Crea planes de dieta semanales personalizados por tiempo de comida
- ✅ Exporta dietas y reportes en formato PDF profesional
- ✅ Hace seguimiento y monitoreo del progreso del paciente
- ✅ Portal del paciente para acceso directo a su plan nutricional

### Datos generales del proyecto

| Aspecto | Detalle |
|---------|---------|
| **Tipo de aplicación** | Web (SaaS) |
| **Tecnología principal** | .NET 8 + React + TypeScript |
| **Arquitectura** | Clean Architecture + REST API + SPA |
| **Base de datos** | PostgreSQL |
| **Duración estimada** | 36 semanas (~9 meses) |
| **Modelo de negocio** | Suscripción mensual / anual |
| **Versión inicial** | 1.0 — 2026 |

---

## 📌 2. Descripción del Sistema

NutriSoftware nace para resolver el problema de los nutricionistas que actualmente trabajan con herramientas dispersas: Excel para dietas, papel para evaluaciones, calendarios separados para citas y procesos manuales para calcular nutrientes. El sistema unifica todo en una plataforma profesional y accesible desde cualquier lugar.

### Problema que resuelve

- Procesos manuales lentos y propensos a errores
- Falta de unificación entre evaluación, planificación y seguimiento
- Dificultad para acceder a información del paciente desde distintos dispositivos
- Ausencia de un portal donde el paciente vea su propio plan
- Imposibilidad de trabajar simultáneamente desde clínica y casa

### Público objetivo

- **Nutricionistas independientes** que atienden consultas privadas
- **Clínicas nutricionales** con múltiples profesionales
- **Centros de salud** con servicios de nutrición
- **Estudiantes de nutrición** en prácticas profesionales

---

## 📚 3. Fuentes de Información — Bases de Datos Nutricionales

El corazón del sistema se alimenta de tres bases de datos nutricionales reconocidas internacionalmente:

### 3.1 TPCA — Tablas Peruanas de Composición de Alimentos

- **Origen**: Instituto Nacional de Salud (INS), Perú
- **Cantidad**: ~700 alimentos
- **Enfoque**: Alimentos peruanos y nativos (quinua, papa, lúcuma, chuño, kiwicha, etc.)
- **Uso principal**: Referencia obligada para nutricionistas en Perú

### 3.2 SMAE — Sistema Mexicano de Alimentos Equivalentes

- **Origen**: México
- **Cantidad**: ~1,500 alimentos
- **Enfoque**: Sistema de intercambios y equivalentes para planificación dietética
- **Uso principal**: Construcción de dietas por porciones equivalentes

### 3.3 USDA — Departamento de Agricultura de EE.UU.

- **Origen**: Estados Unidos
- **Cantidad**: +350,000 alimentos
- **Enfoque**: Base internacional de referencia. Alimentos procesados e importados
- **Uso principal**: Complemento internacional cuando un alimento no está en TPCA ni SMAE

### 3.4 Alimentos Personalizados

- Creados directamente por el nutricionista
- Cantidad ilimitada
- Útil para platillos propios o alimentos regionales no incluidos en las bases

### Cómo funciona el cálculo automático

1. El sistema almacena todos los alimentos con sus valores nutricionales por cada 100 gramos
2. El nutricionista ingresa el peso o porción deseada
3. NutriSoftware calcula automáticamente los nutrientes usando una regla de proporción
4. Ejemplo: 180g de arroz cocido → 234 kcal, 4.3g proteína, 51.5g carbohidratos

---

## ⚖️ 4. Decisión de Plataforma — Web vs Escritorio

### Análisis comparativo

| Criterio | Escritorio (.NET WPF) | Web (Aplicación) |
|----------|----------------------|------------------|
| Instalación | Requiere .exe en cada PC | ✅ Solo URL en navegador |
| Actualizaciones | Manual o automatizada | ✅ Inmediata para todos |
| Multi-dispositivo | Solo Windows | ✅ PC, Mac, Linux, tablet, móvil |
| Acceso remoto | Solo en el PC instalado | ✅ Desde cualquier lugar |
| Velocidad | ✅ Muy rápida (nativa) | ⚠️ Depende de internet |
| Privacidad | ✅ 100% local | ⚠️ Servidor con cifrado |
| Mantenimiento | ⚠️ Por instalación | ✅ Centralizado |
| Multi-usuario | ⚠️ Complicado | ✅ Nativo |
| Modelo de negocio | Licencia por equipo | ✅ Suscripción SaaS |
| Escalabilidad | ⚠️ Limitada | ✅ Ilimitada |

### Decisión final: **WEB**

Razones fundamentadas:

1. **Modelo SaaS escalable** — Ingresos recurrentes mensuales
2. **Acceso desde cualquier lugar** — Mayor flexibilidad para el nutricionista
3. **Portal del paciente** — Solo posible en web
4. **Actualizaciones instantáneas** — Sin reinstalaciones
5. **Mercado más amplio** — No depende del sistema operativo

---

## 🏛️ 5. Arquitectura del Sistema

### Patrón arquitectónico: **Clean Architecture + REST API + SPA**

```
┌──────────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN                      │
│  (Frontend React + Controllers Backend)           │
│   ┌──────────────────────────────────────────┐  │
│   │   CAPA DE APLICACIÓN                      │  │
│   │   (Casos de uso / Services)               │  │
│   │  ┌──────────────────────────────────┐    │  │
│   │  │  CAPA DE DOMINIO                  │    │  │
│   │  │  (Entidades + Reglas de Negocio)  │    │  │
│   │  │  ◉ CORAZÓN DEL SISTEMA            │    │  │
│   │  └──────────────────────────────────┘    │  │
│   │   CAPA DE INFRAESTRUCTURA                 │  │
│   │   (BD, archivos, emails, PDF)             │  │
│   └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Capas explicadas

| Capa | Responsabilidad | Ejemplos |
|------|-----------------|----------|
| **Domain** | Reglas de negocio puras | Paciente, Dieta, cálculo de IMC |
| **Application** | Casos de uso y orquestación | CrearPaciente, CalcularDieta |
| **Infrastructure** | Tecnología y herramientas | PostgreSQL, EF Core, QuestPDF |
| **API** | Endpoints HTTP | Controllers, Middlewares |
| **Frontend** | Interfaz de usuario | Componentes React, formularios |

### ¿Por qué Clean Architecture?

- **Separación de preocupaciones**: cambios en una capa no rompen otras
- **Testeable**: cobertura de pruebas alta posible
- **Escalable**: de 10 a 10,000 usuarios sin reescribir
- **Mantenible**: equipos nuevos entienden rápido
- **Tecnológicamente neutral**: cambiar BD o framework es viable
- **Futura app móvil**: reutiliza el backend completo

### Arquitectura general cliente-servidor

```
   ╔════════════════╗            ╔══════════════════╗
   ║   CLIENTE      ║            ║    SERVIDOR      ║
   ║   (Navegador)  ║◄──HTTPS───►║    (Backend)     ║
   ║                ║   JSON     ║                  ║
   ║   React SPA    ║            ║   .NET 8 API    ║
   ╚════════════════╝            ╚════════╤═════════╝
                                          │
                                 ┌────────┼────────┐
                                 ▼        ▼        ▼
                           ┌────────┐ ┌──────┐ ┌────────┐
                           │Postgre │ │Redis │ │  S3 /  │
                           │  SQL   │ │Cache │ │  Blob  │
                           └────────┘ └──────┘ └────────┘
```

---

## 🛠️ 6. Stack Tecnológico

### Frontend

| Tecnología | Propósito |
|-----------|-----------|
| React 18 | Librería de componentes UI |
| TypeScript | Tipado estático |
| Vite | Build tool moderno y rápido |
| TailwindCSS | Framework de estilos utilitario |
| Shadcn/UI | Componentes UI accesibles |
| Recharts | Gráficos interactivos |
| React Hook Form + Zod | Formularios y validaciones |
| TanStack Query | Manejo de datos del servidor |
| Zustand | Estado global del cliente |

### Backend

| Tecnología | Propósito |
|-----------|-----------|
| .NET 8 + C# | Framework principal del backend |
| Web API | API REST |
| Entity Framework Core | ORM para base de datos |
| AutoMapper | Mapeo entre DTOs y entidades |
| FluentValidation | Validación de inputs |
| MediatR | Patrón Mediator para CQRS |
| Serilog | Sistema de logs estructurados |
| Swagger / OpenAPI | Documentación de la API |
| QuestPDF | Generación de PDFs profesionales |

### Base de Datos y Almacenamiento

| Tecnología | Propósito |
|-----------|-----------|
| PostgreSQL | Base de datos relacional principal |
| Redis | Caché en memoria |
| AWS S3 / Azure Blob | Almacenamiento de fotos y PDFs |

### Autenticación y Seguridad

| Tecnología | Propósito |
|-----------|-----------|
| JWT | Tokens de autenticación |
| Refresh Tokens | Sesiones de larga duración |
| BCrypt | Hash de contraseñas |
| HTTPS / TLS 1.3 | Cifrado de comunicación |

### Infraestructura

| Tecnología | Propósito |
|-----------|-----------|
| Docker + Docker Compose | Contenedores |
| Azure App Service / AWS EC2 | Hosting del backend |
| Vercel / Azure Static Web Apps | Hosting del frontend |
| CloudFlare | CDN y protección DDoS |
| GitHub Actions | CI/CD automático |

---

## 🗄️ 7. Base de Datos

### Esquema general (PostgreSQL)

```sql
-- USUARIOS Y AUTENTICACIÓN
Usuario              (id, email, password_hash, rol, fecha_creacion)
Nutricionista        (id, usuario_id, nombre, especialidad, foto, datos_contacto)
Paciente             (id, nutricionista_id, nombre, fecha_nac, sexo, foto)

-- CITAS
Cita                 (id, paciente_id, fecha_hora, tipo, estado, notas)

-- ALIMENTOS
Alimento             (id, nombre, fuente, categoria,
                      energia, proteinas, grasas, carbos, fibra,
                      micronutrientes_json, es_personalizado, nutricionista_id)
Platillo             (id, nombre, ingredientes_json, nutricionista_id)

-- EVALUACIONES
Antropometria        (id, paciente_id, fecha, nivel_isak, datos_json, diagnostico)
EvaluacionNino       (id, paciente_id, fecha, datos_json, diagnostico, prescripcion)
EvaluacionAdolescente(id, paciente_id, fecha, datos_json, diagnostico, prescripcion)
EvaluacionEmbarazada (id, paciente_id, fecha, semana_gest, imc_pre, datos_json)
EvaluacionAdulto     (id, paciente_id, fecha, tipo, datos_json, prescripcion)

-- BIOQUÍMICA Y CLÍNICA
Bioquimica           (id, paciente_id, fecha, parametros_json, interpretacion)
EvaluacionClinica    (id, paciente_id, fecha, signos_json, deficiencias_detectadas)

-- DIETAS
Dieta                (id, paciente_id, fecha_creacion, nombre, calorias_objetivo)
DiaDieta             (id, dieta_id, dia_semana)
TiempoComida         (id, dia_id, nombre, alimentos_json, totales_json)

-- SEGUIMIENTO
Seguimiento          (id, paciente_id, fecha, peso, medidas_json, observaciones)

-- DOCUMENTOS
PdfGenerado          (id, paciente_id, tipo, url_archivo, fecha)
```

### ¿Por qué PostgreSQL?

- Open source y gratuito
- Soporte robusto para JSON (para datos flexibles)
- Excelente rendimiento con grandes volúmenes
- Replicación y backups nativos
- Compatible con AWS, Azure y Google Cloud
- Ampliamente soportado por Entity Framework Core

---

## 📦 8. Módulos del Sistema

NutriSoftware está compuesto por 14 módulos integrados que cubren el 100% del flujo de trabajo clínico:

| N° | Módulo | Descripción |
|----|--------|-------------|
| 1 | 🔐 Acceso al Sistema | Login seguro con usuario y contraseña. Roles diferenciados |
| 2 | 🏠 Dashboard / Inicio | Resumen del día, citas próximas, accesos rápidos |
| 3 | 📅 Registro de Citas | Calendario mensual y semanal para organizar consultas |
| 4 | 🍎 Buscador de Alimentos | Búsqueda en TPCA, SMAE y USDA con cálculo automático |
| 5 | 📏 Antropometría ISAK | Niveles 1 al 4. Diagnóstico, somatotipo y gráficos |
| 6 | 👶 Evaluación Niños | Para 0 a 11 años. Diagnóstico OMS automático |
| 7 | 🧑 Evaluación Adolescentes | Para 12 a 17 años. Ajuste por etapa puberal |
| 8 | 🤰 Evaluación Embarazadas | IMC pregestacional, ganancia de peso, prescripción |
| 9 | 🧪 Bioquímica Nutricional | Interpretación automática de exámenes de laboratorio |
| 10 | 🩺 Evaluación Clínica | Signos y síntomas con criterios estandarizados |
| 11 | 👤 Evaluación Adulto | Presencial y virtual. Diagnóstico + prescripción |
| 12 | 📈 Seguimiento y Monitoreo | Evolución del paciente consulta a consulta |
| 13 | 🥗 Creación de Dieta | Constructor día a día (7 días). Intercambios |
| 14 | 📄 Exportación PDF | Dieta semanal en formato PDF profesional |

### Detalle de funcionalidades por módulo

#### Módulo 1 — Acceso al Sistema
- Login seguro con usuario y contraseña
- Recuperación de contraseña por email
- Autenticación con JWT y refresh tokens
- Roles: Nutricionista, Paciente, Administrador

#### Módulo 2 — Dashboard
- Resumen del día con citas próximas
- Acceso rápido a biblioteca nutricional
- Estadísticas del mes en curso
- Notificaciones de eventos relevantes

#### Módulo 3 — Registro de Citas
- Vista mensual y semanal del calendario
- Registro de tipo de cita (presencial / virtual)
- Código de colores por tipo de consulta
- Notificaciones automáticas de recordatorio

#### Módulo 4 — Buscador de Alimentos
- Búsqueda combinada en TPCA, SMAE y USDA
- Ingreso de peso y cálculo automático
- Creación de alimentos personalizados
- Diseño de platillos con cálculo de nutrientes

#### Módulo 5 — Antropometría ISAK
- Niveles 1, 2, 3 y 4 completos
- Cálculo automático de IMC, % grasa, somatotipo
- Gráficos circulares y de dispersión
- Fotografía del paciente integrada

#### Módulo 6 — Evaluación Niños
- Para pacientes de 0 a 11 años
- Cálculo de Z-scores OMS
- Diagnóstico nutricional automático
- Prescripción según edad y diagnóstico

#### Módulo 7 — Evaluación Adolescentes
- Para pacientes de 12 a 17 años
- Ajuste por estadio de Tanner
- Percentiles CDC/OMS
- Requerimientos por etapa puberal

#### Módulo 8 — Evaluación Embarazadas
- IMC pregestacional automático
- Control de ganancia de peso (IOM 2009)
- Evaluación de altura uterina
- Prescripción específica por trimestre

#### Módulo 9 — Bioquímica Nutricional
- Registro de exámenes de laboratorio
- Interpretación automática con semáforo
- Alertas para valores fuera de rango
- Historial comparativo entre análisis

#### Módulo 10 — Evaluación Clínica
- Checklist de signos y síntomas por sistema
- Identificación automática de posibles deficiencias
- Vinculación con bioquímica y antropometría

#### Módulo 11 — Evaluación Adulto
- Consulta presencial y virtual
- Diagnóstico nutricional automatizado
- Prescripción nutroterapéutica y dietoterapéutica
- Evaluación dietética por intercambios

#### Módulo 12 — Seguimiento y Monitoreo
- Registro de controles periódicos
- Gráficas de evolución (peso, IMC, medidas)
- Comparativo entre consultas
- Ajustes al plan según resultados

#### Módulo 13 — Creación de Dieta
- Constructor día a día (7 días)
- Asignación por tiempo de comida
- Sistema de intercambios e equivalentes
- Cálculo automático de totales diarios

#### Módulo 14 — Exportación PDF
- Plantillas personalizables con logo
- Diseño profesional para entregar al paciente
- Notas y recomendaciones incluidas
- Almacenamiento en el expediente

---

## 🔄 9. Flujo General del Sistema

```
LOGIN
  └──> DASHBOARD
         └──> Selección de módulo
                │
                ├──> CITAS → Agendar / Ver agenda
                │
                ├──> PACIENTES → Crear / Editar / Ver historial
                │
                ├──> EVALUACIÓN → Tipo de paciente
                │      ├──> Niño (0-11)
                │      ├──> Adolescente (12-17)
                │      ├──> Embarazada
                │      └──> Adulto (presencial/virtual)
                │              │
                │              ├──> Antropometría ISAK
                │              ├──> Bioquímica
                │              └──> Clínica
                │                     │
                │                     ▼
                │             DIAGNÓSTICO AUTOMÁTICO
                │             PRESCRIPCIÓN AUTOMÁTICA
                │                     │
                │                     ▼
                ├──> CREAR DIETA (7 días × tiempos de comida)
                │            │
                │            ▼
                │     EXPORTAR PDF PROFESIONAL
                │
                └──> SEGUIMIENTO → Control de evolución
```

### Flujo detallado por funcionalidad principal

#### Flujo de creación de dieta

1. Seleccionar paciente con evaluación activa
2. Ver requerimientos calculados (mínimos y máximos)
3. Elegir día a planificar (Lunes a Domingo)
4. Seleccionar tiempo de comida (Desayuno / Almuerzo / Cena / Colaciones)
5. Buscar y agregar alimentos con peso específico
6. Sistema suma nutrientes en tiempo real
7. Agregar intercambios o eliminar alimentos según necesidad
8. Repetir para los 7 días de la semana
9. Generar dieta semanal completa
10. Exportar a PDF profesional

---

## 👥 10. Roles de Usuario

### 👨‍⚕️ Rol: Nutricionista (Usuario Principal)

- Gestión completa de pacientes
- Calendario de citas
- Realizar todas las evaluaciones
- Crear y exportar dietas en PDF
- Ver gráficos de evolución
- Acceder desde cualquier dispositivo
- Agregar alimentos personalizados

### 👤 Rol: Paciente (Portal del Paciente)

- Ver su plan nutricional sin descargar nada
- Acceder a su dieta semanal actual
- Reportar su peso semanal desde casa
- Ver gráficos de su progreso
- Recibir notificaciones de citas
- Contactar a su nutricionista

### 🛠️ Rol: Administrador (Para SaaS)

- Gestionar suscripciones
- Ver estadísticas de uso
- Actualizar base de datos de alimentos
- Soporte a usuarios

---

## 🎨 11. Diseño UI/UX

### Principios de diseño

- **Profesional**: aspecto clínico, no de hoja de cálculo
- **Simple**: máximo 3 clics para llegar a cualquier funcionalidad
- **Consistente**: mismos patrones visuales en todo el sistema
- **Accesible**: cumple WCAG 2.1 nivel AA
- **Responsivo**: funciona en escritorio, tablet y móvil

### Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Verde principal | `#1A7A4A` | Acciones primarias, branding |
| Verde oscuro | `#145C38` | Encabezados |
| Verde claro | `#E8F5EE` | Fondos sutiles |
| Naranja acento | `#F0A500` | Alertas, llamadas a la acción |
| Azul | `#1565C0` | Información, enlaces |
| Rojo | `#C0392B` | Errores, alertas críticas |
| Gris oscuro | `#2C2C2C` | Texto principal |
| Gris claro | `#F5F5F5` | Fondos secundarios |

### Tipografía

- **Familia**: Inter, Arial, sans-serif
- **Tamaños**: 12px (small), 14px (body), 16px (large), 24px (headings)

### Componentes principales

- Formularios con validación en tiempo real
- Tablas con paginación, ordenamiento y filtros
- Gráficos interactivos (Recharts)
- Modales para acciones críticas
- Sidebar de navegación lateral
- Top bar con perfil de usuario
- Botones primarios, secundarios y terciarios
- Cards informativas con sombras sutiles
- Tooltips contextuales

---

## 🔒 12. Seguridad y Cumplimiento

### Capas de seguridad

#### 1. Red
- HTTPS obligatorio con TLS 1.3
- CloudFlare como WAF y DDoS protection
- Rate limiting por IP

#### 2. Aplicación
- JWT con expiración corta (15 min)
- Refresh tokens seguros (7 días)
- CORS configurado correctamente
- Headers de seguridad (Helmet)

#### 3. Autenticación
- BCrypt para passwords (cost factor 12)
- 2FA opcional
- Bloqueo tras intentos fallidos

#### 4. Autorización
- Roles diferenciados (Admin / Nutricionista / Paciente)
- Permisos granulares por endpoint
- Validación en cada operación

#### 5. Datos
- Cifrado en reposo (PostgreSQL TDE)
- Cifrado en tránsito (HTTPS)
- Sanitización de inputs
- Prevención SQL Injection (EF Core)

#### 6. Auditoría
- Logs de todas las acciones
- Trazabilidad de cambios
- Detección de anomalías

### Cumplimiento legal

- **Perú**: Ley 29733 de Protección de Datos Personales
- **Internacional**: GDPR si se vende en Europa
- Consentimiento explícito del paciente
- Términos y condiciones claros
- Política de privacidad accesible

---

## 🚀 13. Arquitectura de Despliegue

```
                       INTERNET
                          │
                          ▼
              ┌─────────────────────┐
              │    CLOUDFLARE       │  ← CDN + WAF + DDoS
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   LOAD BALANCER     │  ← Balanceador de carga
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌──────────────┐     ┌──────────────┐
       │  Frontend    │     │  Frontend    │  ← Múltiples
       │  (React)     │     │  (React)     │    instancias
       └──────────────┘     └──────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   API GATEWAY       │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌──────────────┐     ┌──────────────┐
       │  Backend     │     │  Backend     │  ← Auto-scaling
       │  (.NET 8)    │     │  (.NET 8)    │
       └──────────────┘     └──────────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
       ┌──────────┐ ┌────────┐ ┌────────┐
       │PostgreSQL│ │ Redis  │ │ S3 /   │
       │(Primary +│ │ Cache  │ │ Blob   │
       │ Replica) │ │        │ │Storage │
       └──────────┘ └────────┘ └────────┘
```

### Tecnologías de despliegue

| Componente | Tecnología |
|-----------|-----------|
| Contenedores | Docker + Docker Compose |
| Orquestación (futuro) | Kubernetes |
| CI/CD | GitHub Actions |
| Monitoreo | Application Insights / DataDog |
| Logs centralizados | Serilog + Seq |
| Alertas | PagerDuty / Discord |

---

## 📅 14. Cronograma de Desarrollo

### Visión general — 36 semanas (~9 meses)

```
FASE 1 — Fundamentos          Sem.  1 –  4   (4 semanas)
FASE 2 — Módulos base         Sem.  5 – 10   (6 semanas)
FASE 3 — Evaluaciones         Sem. 11 – 18   (8 semanas)
FASE 4 — Dietas y PDF         Sem. 19 – 25   (7 semanas)
FASE 5 — Portal del paciente  Sem. 26 – 30   (5 semanas)
FASE 6 — SaaS y lanzamiento   Sem. 31 – 36   (6 semanas)
```

### Detalle por fase

#### Fase 1 — Fundamentos y Arquitectura (Semanas 1–4)
- Configuración del repositorio Git
- Setup proyecto React + TypeScript + Vite
- Setup proyecto .NET 8 Web API
- Diseño de BD PostgreSQL + migraciones EF Core
- Sistema de autenticación JWT
- Diseño visual completo en Figma
- Setup servidor de desarrollo y staging

#### Fase 2 — Módulos Base (Semanas 5–10)
- Login y registro de nutricionistas
- Dashboard principal
- CRUD de pacientes con foto
- Calendario de citas (vista mensual/semanal)
- Carga de BD: TPCA + SMAE + USDA
- Buscador de alimentos con cálculo automático
- Creación de alimentos y platillos personalizados

#### Fase 3 — Evaluaciones Clínicas (Semanas 11–18)
- Antropometría ISAK (niveles 1-4)
- Cálculos automáticos (IMC, somatotipo, % grasa)
- Evaluación Niños (0-11 años) con Z-scores OMS
- Evaluación Adolescentes (12-17 años)
- Evaluación Embarazadas con IOM 2009
- Bioquímica nutricional con semáforo
- Evaluación Clínica con checklist
- Gráficos interactivos (Recharts)

#### Fase 4 — Evaluación Adulto y Dietas (Semanas 19–25)
- Evaluación Adulto presencial y virtual
- Generador automático de prescripciones
- Constructor de dieta semanal (7 días)
- Drag & drop de alimentos por tiempo de comida
- Sistema de equivalentes e intercambios
- Generador de PDF con QuestPDF
- Plantillas personalizables de PDF

#### Fase 5 — Portal del Paciente (Semanas 26–30)
- Login y registro de pacientes
- Vista de dieta semanal del paciente
- Reporte de peso desde el portal del paciente
- Gráficos de evolución personal
- Notificaciones por email
- Chat o mensajes nutricionista-paciente

#### Fase 6 — Seguimiento, SaaS y Lanzamiento (Semanas 31–36)
- Módulo de Seguimiento y Monitoreo
- Sistema de suscripciones (Stripe / Mercado Pago)
- Panel de administración
- Optimización y pruebas de carga
- Pruebas QA con nutricionistas reales
- Documentación y videos tutoriales
- Despliegue a producción
- Lanzamiento oficial

---

## 💰 15. Modelo de Negocio

### Planes de Suscripción SaaS

| Plan | Precio mensual | Pacientes | Funcionalidades |
|------|---------------|-----------|-----------------|
| **Starter** | USD 15 | Hasta 20 | Módulos básicos, PDF estándar |
| **Profesional** | USD 30 | Hasta 100 | Todo + portal paciente + ISAK completo |
| **Clínica** | USD 80 | Ilimitados | Multi-nutricionista, marca blanca |
| **Anual** | -20% | — | Cualquier plan con descuento |

### Estrategia de monetización

- **Modelo freemium**: 14 días de prueba gratis
- **Descuentos por pago anual**: 20% de descuento
- **Plan estudiantes**: 50% de descuento con verificación
- **Marca blanca**: para clínicas grandes que quieren su propia marca

### Canales de adquisición

- Marketing digital (Google Ads, Meta Ads)
- Alianzas con universidades de nutrición
- Colegios profesionales de nutricionistas
- Influencers en redes sociales del sector
- Webinars y contenido educativo

---

## 💸 16. Análisis Financiero

### Costos de desarrollo (inversión inicial)

| Concepto | Costo |
|----------|-------|
| Desarrollador Fullstack senior (9 meses) | USD 27,000 |
| Diseñador UX/UI (3 meses) | USD 4,500 |
| QA Tester (2 meses) | USD 2,000 |
| Project Manager (9 meses, medio tiempo) | USD 6,750 |
| **TOTAL DESARROLLO** | **USD 40,250** |

### Costos de infraestructura (mensual)

| Servicio | Costo |
|---------|-------|
| Servidor Azure App Service (B2) | USD 30 |
| PostgreSQL gestionado | USD 25 |
| AWS S3 / Azure Blob | USD 10 |
| Redis | USD 15 |
| Dominio + SSL | USD 2 |
| CloudFlare | USD 0 (free plan) |
| Email transaccional (SendGrid) | USD 15 |
| Stripe / Mercado Pago | 3% por transacción |
| **TOTAL MENSUAL** | **~USD 100** |

### Proyección de ingresos

| Escenario | Año | Usuarios | Ingreso mensual | Anual |
|-----------|-----|----------|-----------------|-------|
| **Conservador** | 1 | 100 | USD 3,000 | USD 36,000 |
| **Moderado** | 2 | 500 | USD 15,000 | USD 180,000 |
| **Optimista** | 3 | 2,000 | USD 60,000 | USD 720,000 |

### Punto de equilibrio

- **Mensual**: 4 nutricionistas pagando USD 30/mes cubre infraestructura
- **Recuperación de inversión**: ~14 meses con escenario moderado

---

## ⏭️ 17. Próximos Pasos

### Acciones inmediatas

1. **Validar el modelo de negocio**
   - Entrevistas con 10–15 nutricionistas reales
   - Validar precio y funcionalidades prioritarias
   - Conseguir 5 nutricionistas beta-testers

2. **Definir el equipo de desarrollo**
   - 1 desarrollador fullstack senior
   - 1 diseñador UX/UI (3 meses)
   - 1 project manager (medio tiempo)
   - 1 QA tester (últimas fases)

3. **Configurar entorno de trabajo**
   - Repositorio en GitHub
   - Diseño visual en Figma
   - Hosting en Azure o AWS
   - Dominio y SSL

4. **Obtener fuentes de datos**
   - Conseguir TPCA en formato Excel/CSV
   - Adquirir SMAE oficial
   - Descargar USDA (API gratuita)

5. **Iniciar Fase 1**
   - Setup técnico del proyecto
   - Wireframes y mockups
   - Arquitectura base implementada

6. **Plan de marketing inicial**
   - Crear landing page de pre-lanzamiento
   - Cuenta en redes sociales
   - Lista de espera con incentivos
   - Contenido educativo

---

## 🎯 18. Conclusión

**NutriSoftware** representa una solución completa, moderna y profesional para la práctica nutricional. Centraliza en una sola plataforma web todo lo que un nutricionista necesita: desde el primer contacto con el paciente hasta la entrega de su plan dietético personalizado en PDF.

### Resumen de fortalezas del proyecto

| Aspecto | Fortaleza |
|---------|-----------|
| **Tecnológico** | Clean Architecture, escalable y mantenible |
| **Funcional** | 14 módulos cubren el 100% del flujo clínico |
| **Visual** | Diseño profesional, no aspecto de hoja de cálculo |
| **Negocio** | Modelo SaaS con ingresos recurrentes |
| **Mercado** | Sin competencia fuerte en habla hispana |
| **Escalable** | De Perú a Latinoamérica e internacional |

### Diferenciadores clave

- ✅ Integración nativa con TPCA (única en su categoría)
- ✅ Portal del paciente incluido
- ✅ Cálculos automáticos sin intervención manual
- ✅ PDF profesional con marca personalizable
- ✅ Multi-dispositivo (web responsive)
- ✅ Precio accesible para nutricionistas independientes

### Visión a futuro

Una vez establecida la versión web, las siguientes evoluciones posibles son:

- **App móvil nativa** (React Native, reutilizando la API)
- **Versión PWA** para uso offline
- **Integración con dispositivos** (balanzas Bluetooth, smartwatches)
- **Inteligencia Artificial** para sugerir dietas personalizadas
- **Marketplace** de planes nutricionales entre profesionales
- **Expansión internacional** con bases de datos locales

---

> **NutriSoftware — Ahorra tiempo. Brinda un servicio 100% profesional.**
>
> La herramienta integral que transforma la forma de trabajar del nutricionista moderno.

---

**Documento de Plan de Sistema — NutriSoftware v1.0**
**Año 2026**
