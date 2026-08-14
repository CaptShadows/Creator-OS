$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Assert-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "Run this script from an Administrator PowerShell window."
    }
}

function Get-CreatorOSEnvironment([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { throw "Environment file not found: $Path" }
    $values = @{}
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }
        $index = $trimmed.IndexOf("=")
        if ($index -lt 1) { continue }
        $values[$trimmed.Substring(0, $index).Trim()] = $trimmed.Substring($index + 1).Trim()
    }
    return $values
}

function Resolve-CreatorOSTool([string]$Name) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command -and $Name -in @("pg_dump.exe", "pg_restore.exe")) {
        $command = Get-ChildItem -Path (Join-Path $env:ProgramFiles "PostgreSQL\*\bin\$Name") -File -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
        if ($command) { return $command.FullName }
    }
    if (-not $command) { throw "Required command is not installed or not on PATH: $Name" }
    return $command.Source
}

function Invoke-CreatorOSCommand([string]$FilePath, [string[]]$Arguments) {
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$FilePath failed with exit code $LASTEXITCODE." }
}

function Test-CreatorOSHealth([string]$Url, [int]$Attempts = 1) {
    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            $response = Invoke-RestMethod -Uri $Url -TimeoutSec 10 -UseBasicParsing
            if ($response.status -eq "healthy" -and $response.database.status -eq "healthy") { return $true }
        } catch {
            if ($attempt -eq $Attempts) { return $false }
        }
        Start-Sleep -Seconds ([Math]::Min(2 * $attempt, 10))
    }
    return $false
}

function Protect-CreatorOSPath([string]$Path) {
    $grant = if (Test-Path -LiteralPath $Path -PathType Container) { @("SYSTEM:(OI)(CI)F", "Administrators:(OI)(CI)F") } else { @("SYSTEM:F", "Administrators:F") }
    & icacls.exe $Path /inheritance:r /grant:r $grant | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Could not protect $Path." }
}