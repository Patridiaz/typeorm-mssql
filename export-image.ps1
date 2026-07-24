# Script de PowerShell para compilar y exportar la imagen de Docker a un archivo comprimido

$ImageName = "typeorm-mssql-backend"
$ImageTag = "latest"
$TarFile = "$ImageName.tar"
$GzFile = "$ImageName.tar.gz"
$ZipFile = "$ImageName.tar.zip"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Compilando y Exportando Imagen Docker de Backend       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verificar si Docker está corriendo
Write-Host "Verificando servicio de Docker..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker no está en ejecución. Por favor inicia Docker Desktop e inténtalo de nuevo."
    exit 1
}

# 2. Compilar la imagen Docker localmente
Write-Host "`n1/3 Compilando la imagen docker [${ImageName}:${ImageTag}]..." -ForegroundColor Yellow
docker build -t "${ImageName}:${ImageTag}" .

if ($LASTEXITCODE -ne 0) {
    Write-Error "`nError al compilar la imagen de Docker."
    exit $LASTEXITCODE
}
Write-Host "Imagen compilada correctamente." -ForegroundColor Green

# 3. Exportar la imagen a un archivo .tar
Write-Host "`n2/3 Guardando imagen en archivo temporal ($TarFile)..." -ForegroundColor Yellow
if (Test-Path $TarFile) { Remove-Item $TarFile -Force }
docker save -o $TarFile "${ImageName}:${ImageTag}"

if ($LASTEXITCODE -ne 0) {
    Write-Error "`nError al exportar la imagen a archivo tar."
    exit $LASTEXITCODE
}

# 4. Comprimir el archivo exportado
Write-Host "`n3/3 Comprimiendo el archivo..." -ForegroundColor Yellow
# Windows 10 (Build 17063+) y Windows 11 incluyen tar.exe de forma nativa que soporta compresión gzip
if (Get-Command tar -ErrorAction SilentlyContinue) {
    if (Test-Path $GzFile) { Remove-Item $GzFile -Force }
    tar -czf $GzFile $TarFile
    if ($LASTEXITCODE -eq 0) {
        Remove-Item $TarFile -Force
        Write-Host "`n[ÉXITO] Archivo creado con éxito: $(Get-Location)\$GzFile" -ForegroundColor Green
    } else {
        Write-Warning "`nNo se pudo comprimir con Gzip. Manteniendo archivo .tar sin comprimir."
        Write-Host "`n[ÉXITO] Archivo creado con éxito: $(Get-Location)\$TarFile" -ForegroundColor Green
    }
} else {
    Write-Host "Comando 'tar' no encontrado. Usando compresión zip nativa de PowerShell..." -ForegroundColor Yellow
    if (Test-Path $ZipFile) { Remove-Item $ZipFile -Force }
    Compress-Archive -Path $TarFile -DestinationPath $ZipFile -Force
    Remove-Item $TarFile -Force
    Write-Host "`n[ÉXITO] Archivo creado con éxito: $(Get-Location)\$ZipFile" -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Proceso finalizado. Puedes copiar este archivo al servidor" -ForegroundColor Cyan
Write-Host "y cargarlo usando el comando:" -ForegroundColor Cyan
Write-Host "  docker load -i <archivo>" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
