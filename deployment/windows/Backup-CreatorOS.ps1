param(
    [Parameter(Mandatory)][string]$AppRoot,
    [Parameter(Mandatory)][string]$DataRoot,
    [Parameter(Mandatory)][string]$PgDumpPath,
    [Parameter(Mandatory)][string]$PgRestorePath,
    [Parameter(Mandatory)][string]$GitPath,
    [int]$RetentionDays = 14
)
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
$logRoot = Join-Path $DataRoot "logs"
$logPath = Join-Path $logRoot "backup-latest.log"
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null
Start-Transcript -LiteralPath $logPath -Force | Out-Null
trap {
    $details = $_ | Format-List * -Force | Out-String
    Add-Content -LiteralPath $logPath -Value "`nBACKUP FAILED`n$details"
    Stop-Transcript -ErrorAction SilentlyContinue | Out-Null
    throw
}
$environmentPath = Join-Path $AppRoot ".env.local"
$settings = Get-CreatorOSEnvironment $environmentPath
if (-not $settings.ContainsKey("DATABASE_URL")) { throw "DATABASE_URL is missing from .env.local." }
if (-not $settings.ContainsKey("ATTACHMENT_STORAGE_PATH")) { throw "ATTACHMENT_STORAGE_PATH is missing from .env.local." }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $DataRoot "backups"
$destination = Join-Path $backupRoot $stamp
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$databaseFile = Join-Path $destination "creator-os.dump"
$attachmentsFile = Join-Path $destination "attachments.zip"
$appWasRunning = (Get-ScheduledTask -TaskName "CreatorOS-App" -ErrorAction SilentlyContinue).State -eq "Running"

try {
    if ($appWasRunning) { Stop-CreatorOSApp $DataRoot $AppRoot; Start-Sleep -Seconds 2 }
    Invoke-CreatorOSCommand $PgDumpPath @("--format=custom", "--no-owner", "--file=$databaseFile", $settings["DATABASE_URL"])
    Invoke-CreatorOSCommand $PgRestorePath @("--list", $databaseFile)
    $attachmentPath = $settings["ATTACHMENT_STORAGE_PATH"]
    if (Test-Path -LiteralPath $attachmentPath) {
        Compress-Archive -LiteralPath $attachmentPath -DestinationPath $attachmentsFile -CompressionLevel Optimal
    } else {
        New-Item -ItemType File -Path (Join-Path $destination "attachments-not-configured.txt") | Out-Null
    }
    @{
        createdAt = (Get-Date).ToString("o")
        computer = $env:COMPUTERNAME
        databaseBytes = (Get-Item -LiteralPath $databaseFile).Length
        attachmentsIncluded = (Test-Path -LiteralPath $attachmentsFile)
        gitCommit = (& $GitPath -c "safe.directory=$AppRoot" -C $AppRoot rev-parse HEAD 2>$null)
    } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination "manifest.json") -Encoding UTF8
} catch {
    if (Test-Path -LiteralPath $destination) { Remove-Item -LiteralPath $destination -Recurse -Force }
    throw
} finally {
    if ($appWasRunning) { Start-ScheduledTask -TaskName "CreatorOS-App" }
}

Get-ChildItem -LiteralPath $backupRoot -Directory | Where-Object LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) | Remove-Item -Recurse -Force
Write-Host "Verified backup created: $destination"
Stop-Transcript | Out-Null
