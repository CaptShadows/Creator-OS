param(
    [string]$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")),
    [string]$DataRoot = "C:\ProgramData\CreatorOS",
    [string]$PublicUrl = "http://localhost:3000",
    [int]$Port = 3000,
    [int]$BackupRetentionDays = 14
)
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
Assert-Administrator
$AppRoot = (Resolve-Path -LiteralPath $AppRoot).Path
$environmentPath = Join-Path $AppRoot ".env.local"
$settings = Import-CreatorOSEnvironment $environmentPath
foreach ($required in @("DATABASE_URL", "ATTACHMENT_STORAGE_PATH")) { if (-not $settings.ContainsKey($required)) { throw "$required is missing from .env.local." } }
if ($settings.ContainsKey("OWNER_PASSWORD")) { throw "Remove OWNER_EMAIL, OWNER_DISPLAY_NAME, and OWNER_PASSWORD from .env.local after owner bootstrap before production installation." }
if (-not [IO.Path]::IsPathRooted($settings["ATTACHMENT_STORAGE_PATH"])) { throw "ATTACHMENT_STORAGE_PATH must be absolute." }

$node = Resolve-CreatorOSTool "node.exe"
$npm = Resolve-CreatorOSTool "npm.cmd"
$pgDump = Resolve-CreatorOSTool "pg_dump.exe"
$pgRestore = Resolve-CreatorOSTool "pg_restore.exe"
$git = Resolve-CreatorOSTool "git.exe"
$major = [int]((& $node --version).TrimStart("v").Split(".")[0])
if ($major -lt 22) { throw "Creator OS production requires Node.js 22 or newer. Found $(& $node --version)." }

New-Item -ItemType Directory -Force -Path $DataRoot, (Join-Path $DataRoot "logs"), (Join-Path $DataRoot "backups"), $settings["ATTACHMENT_STORAGE_PATH"] | Out-Null
Protect-CreatorOSPath $DataRoot
Protect-CreatorOSPath $environmentPath
Invoke-CreatorOSCommand $npm @("ci", "--prefix", $AppRoot)
Invoke-CreatorOSCommand $npm @("run", "db:migrate", "--prefix", $AppRoot)
Invoke-CreatorOSCommand $npm @("run", "build", "--prefix", $AppRoot)

$runScript = Join-Path $PSScriptRoot "Run-CreatorOS.ps1"
$backupScript = Join-Path $PSScriptRoot "Backup-CreatorOS.ps1"
$appArguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runScript`" -AppRoot `"$AppRoot`" -DataRoot `"$DataRoot`" -NodePath `"$node`" -Port $Port"
$backupArguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$backupScript`" -AppRoot `"$AppRoot`" -DataRoot `"$DataRoot`" -PgDumpPath `"$pgDump`" -PgRestorePath `"$pgRestore`" -GitPath `"$git`" -RetentionDays $BackupRetentionDays"
$appAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $appArguments
$appTrigger = New-ScheduledTaskTrigger -AtStartup
$appSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "CreatorOS-App" -Action $appAction -Trigger $appTrigger -Settings $appSettings -Principal $principal -Force | Out-Null
$backupAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $backupArguments
$backupTrigger = New-ScheduledTaskTrigger -Daily -At "2:00 AM"
Register-ScheduledTask -TaskName "CreatorOS-Backup" -Action $backupAction -Trigger $backupTrigger -Settings (New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 4) -StartWhenAvailable -MultipleInstances IgnoreNew) -Principal $principal -Force | Out-Null

$shortcutPath = Join-Path $env:PUBLIC "Desktop\Creator OS.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$env:WINDIR\explorer.exe"
$shortcut.Arguments = $PublicUrl
$shortcut.Description = "Open Creator OS"
$shortcut.Save()

Start-ScheduledTask -TaskName "CreatorOS-App"
if (-not (Test-CreatorOSHealth "$PublicUrl/api/health" 12)) { throw "Creator OS did not become healthy. Run Manage-CreatorOS.ps1 -Action Logs." }
Start-ScheduledTask -TaskName "CreatorOS-Backup"
Start-Sleep -Seconds 2
while ((Get-ScheduledTask -TaskName "CreatorOS-Backup").State -in @("Running", "Queued")) { Start-Sleep -Seconds 2 }
$backupResult = (Get-ScheduledTaskInfo -TaskName "CreatorOS-Backup").LastTaskResult
if ($backupResult -ne 0) { throw "Initial backup failed with Task Scheduler result $backupResult." }
Write-Host "Creator OS installed successfully. Shortcut: $shortcutPath"
Write-Host "Git executable recorded for update operations: $git"