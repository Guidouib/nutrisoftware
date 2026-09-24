<#
.SYNOPSIS
    Respalda la base de datos de NutriSoftware a un archivo local.

.DESCRIPTION
    Genera un volcado comprimido con pg_dump (formato custom, -Fc) que se
    restaura con pg_restore. Usa la imagen de Docker de Postgres, así que no
    hace falta instalar el cliente de Postgres en Windows.

    El volcado queda en formato PostgreSQL a propósito: un respaldo solo sirve
    si se puede restaurar, y solo Postgres puede releer esto. Exportarlo a
    SQL Server sería una migración, no un respaldo.

.PARAMETER CadenaConexion
    Cadena de Neon. Si se omite, se toma de la variable de entorno
    NUTRISOFTWARE_DB para no dejar la contraseña en el historial de comandos.

.PARAMETER Destino
    Carpeta donde guardar. Por defecto, .\respaldos junto a este script.

.PARAMETER DiasRetencion
    Antigüedad máxima de los respaldos a conservar. 0 = no borrar nada.

.EXAMPLE
    $env:NUTRISOFTWARE_DB = "postgresql://usuario:clave@host/neondb?sslmode=require"
    .\respaldar-bd.ps1

.EXAMPLE
    .\respaldar-bd.ps1 -Destino "D:\Respaldos\NutriSoftware" -DiasRetencion 60
#>

[CmdletBinding()]
param(
    [string]$CadenaConexion = $env:NUTRISOFTWARE_DB,
    [string]$Destino = (Join-Path $PSScriptRoot "respaldos"),
    [int]$DiasRetencion = 30,
    [string]$ImagenPostgres = "postgres:18-alpine"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($CadenaConexion)) {
    throw "Falta la cadena de conexion. Defini NUTRISOFTWARE_DB o pasa -CadenaConexion."
}

# La version del cliente debe ser >= la del servidor; pg_dump se niega a
# volcar una base mas nueva que el.
docker version --format '{{.Server.Version}}' *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Docker no responde. Abri Docker Desktop y volve a intentar."
}

if (-not (Test-Path $Destino)) {
    New-Item -ItemType Directory -Path $Destino -Force | Out-Null
}

$marca   = Get-Date -Format "yyyy-MM-dd_HHmm"
$nombre  = "nutrisoftware_$marca.dump"
$archivo = Join-Path $Destino $nombre

Write-Host "Respaldando a $archivo ..."

# pg_dump escribe con -f dentro del volumen montado, no por la tuberia:
# PowerShell 5.1 convierte a texto la salida de un ejecutable y corromperia
# el binario.
#
# --no-owner y --no-acl: el rol de Neon no existe en otras instancias, y sin
# esto la restauracion falla al intentar asignar permisos a un usuario ausente.
docker run --rm -v "${Destino}:/bk" $ImagenPostgres `
    pg_dump $CadenaConexion -Fc --no-owner --no-acl -f "/bk/$nombre"

if ($LASTEXITCODE -ne 0) {
    Remove-Item $archivo -ErrorAction SilentlyContinue
    throw "pg_dump fallo. Revisa la cadena de conexion."
}

$tam = (Get-Item $archivo).Length
if ($tam -lt 10KB) {
    Remove-Item $archivo
    throw "El respaldo quedo en $tam bytes: demasiado chico para ser valido."
}

# Verificacion real: si el indice del volcado no se puede leer, el archivo no
# sirve. Un respaldo que nunca se probo no es un respaldo.
$tablas = (docker run --rm -v "${Destino}:/bk" $ImagenPostgres `
    pg_restore -l "/bk/$nombre" |
    Select-String "TABLE DATA").Count

if ($tablas -lt 1) {
    throw "El volcado no contiene tablas. Algo salio mal."
}

Write-Host ("OK - {0:N0} KB - {1} tablas" -f ($tam / 1KB), $tablas) -ForegroundColor Green

if ($DiasRetencion -gt 0) {
    $limite = (Get-Date).AddDays(-$DiasRetencion)
    $viejos = Get-ChildItem $Destino -Filter "nutrisoftware_*.dump" |
              Where-Object { $_.LastWriteTime -lt $limite }
    foreach ($v in $viejos) {
        Remove-Item $v.FullName
        Write-Host "  borrado por antiguedad: $($v.Name)"
    }
}

Write-Host ""
Write-Host "Para restaurar sobre una base VACIA:"
Write-Host "  (si el destino es un Postgres mas viejo que el origen, vas a ver"
Write-Host "   un aviso por 'transaction_timeout'; es inofensivo)"
Write-Host "  docker run --rm -v `"${Destino}:/bk`" $ImagenPostgres ``"
Write-Host "    pg_restore -d `"<cadena-destino>`" --no-owner --no-acl /bk/$nombre"
