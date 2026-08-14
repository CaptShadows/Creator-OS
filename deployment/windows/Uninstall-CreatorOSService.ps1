param([switch]$RemoveShortcut,[string]$DataRoot="C:\ProgramData\CreatorOS",[string]$AppRoot=(Resolve-Path (Join-Path $PSScriptRoot "..\..")))
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
Assert-Administrator
Stop-CreatorOSApp $DataRoot $AppRoot
Unregister-ScheduledTask -TaskName "CreatorOS-App" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "CreatorOS-Backup" -Confirm:$false -ErrorAction SilentlyContinue
if ($RemoveShortcut) { Remove-Item -LiteralPath (Join-Path $env:PUBLIC "Desktop\Creator OS.lnk") -Force -ErrorAction SilentlyContinue }
Write-Host "Creator OS background tasks were removed. Application files, environment settings, PostgreSQL data, attachments, logs, and backups were preserved."