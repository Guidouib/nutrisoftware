# ─────────────────────────────────────────────────────────────────────
# Imagen del API de NutriSoftware (.NET 10) para Koyeb.
# Contexto de build: la raiz del repositorio.
# ─────────────────────────────────────────────────────────────────────

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos primero los csproj para que la restauracion quede cacheada y
# no se repita cada vez que cambia una linea de codigo.
COPY backend/NutriSoftware.slnx ./backend/
COPY backend/src/NutriSoftware.Domain/*.csproj         ./backend/src/NutriSoftware.Domain/
COPY backend/src/NutriSoftware.Application/*.csproj    ./backend/src/NutriSoftware.Application/
COPY backend/src/NutriSoftware.Infrastructure/*.csproj ./backend/src/NutriSoftware.Infrastructure/
COPY backend/src/NutriSoftware.API/*.csproj            ./backend/src/NutriSoftware.API/
RUN dotnet restore backend/src/NutriSoftware.API/NutriSoftware.API.csproj

COPY backend/ ./backend/
RUN dotnet publish backend/src/NutriSoftware.API/NutriSoftware.API.csproj \
      -c Release -o /app/publish --no-restore

# ─────────────────────────────────────────────────────────────────────

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# QuestPDF renderiza con SkiaSharp, que enlaza contra libfontconfig y
# libfreetype: sin ellas la generacion de PDF revienta en tiempo de
# ejecucion con DllNotFoundException, no al compilar. Las fuentes DejaVu
# cubren los acentos y la enie del contenido en español.
RUN apt-get update \
 && apt-get install -y --no-install-recommends libfontconfig1 libfreetype6 fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish ./

# Koyeb enruta al 8000 por defecto.
ENV ASPNETCORE_HTTP_PORTS=8000 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_gcServer=0
EXPOSE 8000

# El contenedor libre de Koyeb trae 512 MB: sin este tope el GC de .NET
# calcula el presupuesto sobre la RAM del host y termina con OOMKilled.
ENV DOTNET_GCHeapHardLimit=0x10000000

ENTRYPOINT ["dotnet", "NutriSoftware.API.dll"]
