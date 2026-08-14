param(
    [ValidateSet("Status", "Start", "Stop", "Restart", "Health", "Logs", "Backup")][string]$Action = "Status",
    [string]$DataRoot = "C:\ProgramData\CreatorOS",
    [string]$PublicUrl = "http://localhost:3000"
)
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
switch ($Action) {
    "Status" { Get-ScheduledTask -TaskName "CreatorOS-App", "CreatorOS-Backup" | Select-Object TaskName, State }
    "Start" { Start-ScheduledTask -TaskName "CreatorOS-App" }
    "Stop" { Stop-ScheduledTask -TaskName "CreatorOS-App" }
    "Restart" { Stop-ScheduledTask -TaskName "CreatorOS-App" -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; Start-ScheduledTask -TaskName "CreatorOS-App" }
    "Health" { if (Test-CreatorOSHealth "$PublicUrl/api/health") { Write-Host "Creator OS and PostgreSQL are healthy." } else { throw "Creator OS health check failed." } }
    "Logs" { Get-ChildItem -LiteralPath (Join-Path $DataRoot "logs") -Filter "app-*.log" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 2 | ForEach-Object { Write-Host "`n$($_.FullName)"; Get-Content -LiteralPath $_.FullName -Tail 100 } }
    "Backup" { Start-ScheduledTask -TaskName "CreatorOS-Backup" }
}