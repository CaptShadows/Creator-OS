param(
    [Parameter(Mandatory)][string]$Commit,
    [string]$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")),
    [string]$PublicUrl = "http://localhost:3000"
)
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
Assert-Administrator
$AppRoot = (Resolve-Path -LiteralPath $AppRoot).Path
$npm = Resolve-CreatorOSTool "npm.cmd"
$git = Resolve-CreatorOSTool "git.exe"
if (& $git -C $AppRoot status --porcelain) { throw "The production checkout has uncommitted changes. Rollback stopped." }
Stop-ScheduledTask -TaskName "CreatorOS-App" -ErrorAction SilentlyContinue
Invoke-CreatorOSCommand $git @("-C", $AppRoot, "switch", "--detach", $Commit)
Invoke-CreatorOSCommand $npm @("ci", "--prefix", $AppRoot)
Invoke-CreatorOSCommand $npm @("run", "build", "--prefix", $AppRoot)
Start-ScheduledTask -TaskName "CreatorOS-App"
if (-not (Test-CreatorOSHealth "$PublicUrl/api/health" 12)) { throw "Rollback revision failed its health check." }
Write-Host "Application rolled back to $Commit. Database migrations were not reversed."