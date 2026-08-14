param(
    [Parameter(Mandatory)][string]$AppRoot,
    [Parameter(Mandatory)][string]$DataRoot,
    [Parameter(Mandatory)][string]$NodePath,
    [int]$Port = 3000,
    [string]$HostName = "0.0.0.0"
)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$logRoot = Join-Path $DataRoot "logs"
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null
Set-Location -LiteralPath $AppRoot
$env:NODE_ENV = "production"
$env:PORT = [string]$Port
$env:HOSTNAME = $HostName
$next = Join-Path $AppRoot "node_modules\next\dist\bin\next"
if (-not (Test-Path -LiteralPath $next)) { throw "Production dependencies are missing. Run Install-CreatorOS.ps1 or Update-CreatorOS.ps1." }

$failures = 0
while ($true) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $stdout = Join-Path $logRoot "app-$stamp.stdout.log"
    $stderr = Join-Path $logRoot "app-$stamp.stderr.log"
    $process = Start-Process -FilePath $NodePath -ArgumentList @($next, "start", "-H", $HostName, "-p", [string]$Port) -WorkingDirectory $AppRoot -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -WindowStyle Hidden
    Set-Content -LiteralPath (Join-Path $DataRoot "app.pid") -Value $process.Id
    $process.WaitForExit()
    Remove-Item -LiteralPath (Join-Path $DataRoot "app.pid") -Force -ErrorAction SilentlyContinue
    if ($process.ExitCode -eq 0) { $failures = 0 } else { $failures++ }
    Get-ChildItem -LiteralPath $logRoot -Filter "app-*.log" -File | Sort-Object LastWriteTime -Descending | Select-Object -Skip 40 | Remove-Item -Force
    Start-Sleep -Seconds ([Math]::Min([Math]::Pow(2, [Math]::Min($failures, 5)), 30))
}