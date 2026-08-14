param(
    [string]$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")),
    [string]$DataRoot = "C:\ProgramData\CreatorOS",
    [string]$PublicUrl = "http://localhost:3000"
)
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
Assert-Administrator
$AppRoot = (Resolve-Path -LiteralPath $AppRoot).Path
$null = Import-CreatorOSEnvironment (Join-Path $AppRoot ".env.local")
$npm = Resolve-CreatorOSTool "npm.cmd"
$git = Resolve-CreatorOSTool "git.exe"
$previous = (& $git -C $AppRoot rev-parse HEAD).Trim()
if (& $git -C $AppRoot status --porcelain) { throw "The production checkout has uncommitted changes. Update stopped without changing anything." }
Start-ScheduledTask -TaskName "CreatorOS-Backup"
Start-Sleep -Seconds 2
do { Start-Sleep -Seconds 2; $backupState = (Get-ScheduledTask -TaskName "CreatorOS-Backup").State } while ($backupState -in @("Running", "Queued"))
if ((Get-ScheduledTaskInfo -TaskName "CreatorOS-Backup").LastTaskResult -ne 0) { throw "Pre-update backup failed. Update stopped before changing the application." }
Stop-CreatorOSApp $DataRoot $AppRoot
try {
    Invoke-CreatorOSCommand $git @("-C", $AppRoot, "fetch", "origin", "main")
    Invoke-CreatorOSCommand $git @("-C", $AppRoot, "switch", "--detach", "origin/main")
    Invoke-CreatorOSCommand $npm @("ci", "--prefix", $AppRoot)
    Invoke-CreatorOSCommand $npm @("run", "db:migrate", "--prefix", $AppRoot)
    Invoke-CreatorOSCommand $npm @("run", "build", "--prefix", $AppRoot)
    Set-Content -LiteralPath (Join-Path $DataRoot "known-good-commit.txt") -Value $previous
    Start-ScheduledTask -TaskName "CreatorOS-App"
    if (-not (Test-CreatorOSHealth "$PublicUrl/api/health" 12)) { throw "Updated application failed its health check. Roll back the application revision." }
} catch {
    Start-ScheduledTask -TaskName "CreatorOS-App" -ErrorAction SilentlyContinue
    throw
}
Write-Host "Creator OS updated successfully to $(& $git -C $AppRoot rev-parse HEAD)."