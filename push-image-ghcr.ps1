# Script de PowerShell para compilar, etiquetar y subir la imagen Docker a GitHub Container Registry (GHCR)

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [string]$GithubUser = "Patridiaz", # Nombre de usuario o de organización de GitHub
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "typeorm-mssql", # Nombre del repositorio
    
    [Parameter(Mandatory=$false)]
    [string]$TagName = "latest" # Etiqueta de la imagen (tag)
)

$LocalImageName = "typeorm-mssql-backend"
$RegistryHost = "ghcr.io"
$TargetImageName = "$RegistryHost/$($GithubUser.ToLower())/$($RepoName.ToLower()):$TagName"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Subiendo Imagen Docker a GitHub Container Registry     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Usuario/Org GitHub: $GithubUser" -ForegroundColor Gray
Write-Host "Repositorio:        $RepoName" -ForegroundColor Gray
Write-Host "Etiqueta (Tag):     $TagName" -ForegroundColor Gray
Write-Host "Imagen Destino:     $TargetImageName" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verificar si Docker está corriendo
Write-Host "Verificando servicio de Docker..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker no está en ejecución. Por favor inicia Docker Desktop e inténtalo de nuevo."
    exit 1
}

# 2. Compilar la imagen localmente (por si acaso no está compilada o hay cambios)
Write-Host "`n1/4 Compilando imagen local [${LocalImageName}:latest]..." -ForegroundColor Yellow
docker build -t "${LocalImageName}:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo la compilación de la imagen local."
    exit $LASTEXITCODE
}

# 3. Preguntar si el usuario necesita iniciar sesión en GHCR
Write-Host "`n2/4 Inicio de sesión en GHCR..." -ForegroundColor Yellow
Write-Host "Si ya has iniciado sesión en ghcr.io anteriormente en esta máquina, puedes saltarte este paso." -ForegroundColor Gray
$choice = Read-Host "¿Deseas iniciar sesión en ghcr.io ahora? (S/N)"
if ($choice -match "[sS]") {
    Write-Host "`nPara iniciar sesión, necesitas un Personal Access Token (PAT) de GitHub con alcance 'write:packages'." -ForegroundColor Cyan
    $token = Read-Host -AsSecureString "Introduce tu Personal Access Token (PAT) de GitHub"
    if ($token) {
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
        $PlainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        # Enviar token por stdin a docker login
        $PlainToken | docker login $RegistryHost -u $GithubUser --password-stdin
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Fallo el inicio de sesión en GHCR. Asegúrate de que el usuario y token sean válidos."
        } else {
            Write-Host "Sesión iniciada con éxito en GHCR." -ForegroundColor Green
        }
    } else {
        Write-Warning "Token vacío. Omitiendo inicio de sesión."
    }
} else {
    Write-Host "Saltando inicio de sesión en GHCR..." -ForegroundColor Gray
}

# 4. Etiquetar la imagen local para GHCR
Write-Host "`n3/4 Etiquetando imagen para GHCR..." -ForegroundColor Yellow
Write-Host "Etiquetando '${LocalImageName}:latest' como '$TargetImageName'..." -ForegroundColor Gray
docker tag "${LocalImageName}:latest" $TargetImageName
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al etiquetar la imagen."
    exit $LASTEXITCODE
}
Write-Host "Imagen etiquetada correctamente." -ForegroundColor Green

# 5. Subir la imagen a GHCR
Write-Host "`n4/4 Subiendo la imagen a GHCR..." -ForegroundColor Yellow
docker push $TargetImageName
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al subir la imagen a GHCR. Asegúrate de tener permisos de escritura sobre el paquete."
    exit $LASTEXITCODE
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " [ÉXITO] Imagen subida correctamente a GHCR:" -ForegroundColor Green
Write-Host " $TargetImageName" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
