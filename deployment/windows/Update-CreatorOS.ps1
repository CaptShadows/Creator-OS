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
if ((Invoke-CreatorOSTaskAndWait "CreatorOS-Backup") -ne 0) { throw "Pre-update backup failed. Update stopped before changing the application." }
Stop-CreatorOSApp $DataRoot $AppRoot
try {
    Invoke-CreatorOSCommand $git @("-C", $AppRoot, "fetch", "origin", "main")
    Invoke-CreatorOSCommand $git @("-C", $AppRoot, "switch", "--detach", "origin/main")
    Invoke-CreatorOSCommand $npm @("ci", "--prefix", $AppRoot)
    Invoke-CreatorOSCommand $npm @("run", "db:migrate", "--prefix", $AppRoot)
    Invoke-CreatorOSCommand $npm @("run", "build", "--prefix", $AppRoot)
    $iconPath = Join-Path $DataRoot "CreatorOS.ico"
    $iconBase64 = Get-Content -LiteralPath (Join-Path $PSScriptRoot "CreatorOS.ico.b64") -Raw
    [IO.File]::WriteAllBytes($iconPath, [Convert]::FromBase64String($iconBase64))
    $shortcutPath = Join-Path $env:PUBLIC "Desktop\Creator OS.lnk"
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "$env:WINDIR\explorer.exe"
    $shortcut.Arguments = $PublicUrl
    $shortcut.Description = "Open Creator OS"
    $shortcut.IconLocation = "$iconPath,0"
    $shortcut.Save()
    Set-Content -LiteralPath (Join-Path $DataRoot "known-good-commit.txt") -Value $previous
    Start-ScheduledTask -TaskName "CreatorOS-App"
    if (-not (Test-CreatorOSHealth "$PublicUrl/api/health" 12)) { throw "Updated application failed its health check. Roll back the application revision." }
} catch {
    Start-ScheduledTask -TaskName "CreatorOS-App" -ErrorAction SilentlyContinue
    throw
}
Write-Host "Creator OS updated successfully to $(& $git -C $AppRoot rev-parse HEAD)."
