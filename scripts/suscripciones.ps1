<#
.SYNOPSIS
    Administra las suscripciones de los nutricionistas (cobro manual).

.DESCRIPTION
    Con cobro manual, el flujo es: el cliente paga por Yape o transferencia y
    vos le extendés el acceso. Este script hace eso sin tener que escribir SQL
    a mano contra producción.

    Usa la imagen de Docker de Postgres, así que no hace falta instalar nada.
    La cadena de conexión se toma de la variable NUTRISOFTWARE_DB.

.PARAMETER Accion
    listar    — todos los nutricionistas con su vencimiento y días restantes
    extender  — suma meses al vencimiento (desde hoy si ya venció)
    fijar     — pone una fecha exacta de vencimiento
    suspender — corta el acceso sin tocar la fecha
    reactivar — levanta la suspensión
    libre     — quita el vencimiento (cuenta de cortesía o interna)

.EXAMPLE
    .\suscripciones.ps1 listar

.EXAMPLE
    # Pagó 3 meses
    .\suscripciones.ps1 extender -Email ana@clinica.com -Meses 3 -Nota "Yape 25/09, S/150"

.EXAMPLE
    .\suscripciones.ps1 suspender -Email moroso@clinica.com -Nota "Sin pago desde agosto"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0)]
    [ValidateSet('listar', 'extender', 'fijar', 'suspender', 'reactivar', 'libre')]
    [string]$Accion,

    [string]$Email,
    [int]$Meses = 1,
    [string]$Hasta,
    [string]$Nota,
    [string]$CadenaConexion = $env:NUTRISOFTWARE_DB,
    [string]$ImagenPostgres = "postgres:18-alpine"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($CadenaConexion)) {
    throw "Falta la cadena de conexion. Defini NUTRISOFTWARE_DB o pasa -CadenaConexion."
}

if ($Accion -ne 'listar' -and [string]::IsNullOrWhiteSpace($Email)) {
    throw "La accion '$Accion' necesita -Email."
}

function Invoke-Sql([string]$sql) {
    # El SQL va por archivo y no por -c: PowerShell 5.1 se come las comillas
    # dobles al pasar argumentos a un ejecutable nativo, y sin ellas Postgres
    # pasa los identificadores a minuscula y no encuentra "Nutricionistas".
    $carpeta = Join-Path ([IO.Path]::GetTempPath()) ("ns_" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $carpeta -Force | Out-Null
    try {
        $archivo = Join-Path $carpeta "consulta.sql"
        # Sin BOM: psql lo interpretaria como parte de la primera sentencia.
        [IO.File]::WriteAllText($archivo, $sql, [Text.UTF8Encoding]::new($false))

        # -v ON_ERROR_STOP=1 hace que psql devuelva codigo distinto de cero
        # ante un error; sin esto el script seguiria como si nada.
        $salida = docker run --rm -v "${carpeta}:/sql" $ImagenPostgres `
            psql $CadenaConexion -v ON_ERROR_STOP=1 -f /sql/consulta.sql 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw ($salida -join "`n")
        }
        return $salida
    }
    finally {
        Remove-Item $carpeta -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Escapa comillas simples para no romper la sentencia ni permitir inyeccion
# desde un parametro.
function Esc([string]$s) {
    if ($null -eq $s) { return "NULL" }
    return "'" + $s.Replace("'", "''") + "'"
}

switch ($Accion) {

    'listar' {
        Invoke-Sql @"
SELECT u."Email",
       n."Nombres" || ' ' || n."Apellidos" AS nombre,
       CASE
         WHEN n."SuscripcionSuspendida" THEN 'SUSPENDIDA'
         WHEN n."SuscripcionHasta" IS NULL THEN 'sin vencimiento'
         WHEN n."SuscripcionHasta" < CURRENT_DATE THEN 'VENCIDA'
         ELSE 'activa'
       END AS estado,
       n."SuscripcionHasta" AS vence,
       CASE WHEN n."SuscripcionHasta" IS NULL THEN NULL
            ELSE n."SuscripcionHasta" - CURRENT_DATE END AS dias,
       (SELECT count(*) FROM "Pacientes" p
         WHERE p."NutricionistaId" = n."Id" AND p."Activo") AS pacientes,
       n."NotaSuscripcion" AS nota
FROM "Nutricionistas" n
JOIN "Usuarios" u ON u."Id" = n."UsuarioId"
ORDER BY n."SuscripcionHasta" NULLS LAST;
"@
    }

    'extender' {
        # GREATEST con CURRENT_DATE: si ya vencio, los meses cuentan desde hoy
        # y no desde una fecha pasada, que regalaria tiempo perdido.
        Invoke-Sql @"
UPDATE "Nutricionistas" n
SET "SuscripcionHasta" =
      GREATEST(COALESCE(n."SuscripcionHasta", CURRENT_DATE), CURRENT_DATE)
      + INTERVAL '$Meses months',
    "SuscripcionSuspendida" = false,
    "NotaSuscripcion" = COALESCE($(Esc $Nota), n."NotaSuscripcion")
FROM "Usuarios" u
WHERE u."Id" = n."UsuarioId" AND u."Email" = $(Esc $Email);
"@
    }

    'fijar' {
        if ([string]::IsNullOrWhiteSpace($Hasta)) { throw "Falta -Hasta (aaaa-mm-dd)." }
        Invoke-Sql @"
UPDATE "Nutricionistas" n
SET "SuscripcionHasta" = $(Esc $Hasta)::date,
    "SuscripcionSuspendida" = false,
    "NotaSuscripcion" = COALESCE($(Esc $Nota), n."NotaSuscripcion")
FROM "Usuarios" u
WHERE u."Id" = n."UsuarioId" AND u."Email" = $(Esc $Email);
"@
    }

    'suspender' {
        Invoke-Sql @"
UPDATE "Nutricionistas" n
SET "SuscripcionSuspendida" = true,
    "NotaSuscripcion" = COALESCE($(Esc $Nota), n."NotaSuscripcion")
FROM "Usuarios" u
WHERE u."Id" = n."UsuarioId" AND u."Email" = $(Esc $Email);
"@
    }

    'reactivar' {
        Invoke-Sql @"
UPDATE "Nutricionistas" n
SET "SuscripcionSuspendida" = false,
    "NotaSuscripcion" = COALESCE($(Esc $Nota), n."NotaSuscripcion")
FROM "Usuarios" u
WHERE u."Id" = n."UsuarioId" AND u."Email" = $(Esc $Email);
"@
    }

    'libre' {
        Invoke-Sql @"
UPDATE "Nutricionistas" n
SET "SuscripcionHasta" = NULL,
    "SuscripcionSuspendida" = false,
    "NotaSuscripcion" = COALESCE($(Esc $Nota), n."NotaSuscripcion")
FROM "Usuarios" u
WHERE u."Id" = n."UsuarioId" AND u."Email" = $(Esc $Email);
"@
    }
}

if ($Accion -ne 'listar') {
    Write-Host "Listo. Estado actual:" -ForegroundColor Green
    # El usuario tiene que volver a entrar: el estado viaja en la respuesta
    # de login y no se re-consulta en cada peticion.
    Write-Host "(el cambio se aplica al instante; si estaba dentro, que vuelva a iniciar sesion)"
    Write-Host ""
    & $PSCommandPath listar -CadenaConexion $CadenaConexion -ImagenPostgres $ImagenPostgres
}
