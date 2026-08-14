param(
    [Parameter(Mandatory)][string]$BackupDirectory,
    [Parameter(Mandatory)][string]$TestDatabaseUrl,
    [string]$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")),
    [string]$TestAttachmentPath = "C:\ProgramData\CreatorOS\restore-test\attachments"
)
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
Assert-Administrator
$databaseFile = Join-Path $BackupDirectory "creator-os.dump"
$attachmentsFile = Join-Path $BackupDirectory "attachments.zip"
if (-not (Test-Path -LiteralPath $databaseFile)) { throw "Backup dump not found: $databaseFile" }
$pgRestore = Resolve-CreatorOSTool "pg_restore.exe"
$npm = Resolve-CreatorOSTool "npm.cmd"

Write-Host "The test database must already exist and be empty. The live DATABASE_URL is never accepted implicitly."
Invoke-CreatorOSCommand $pgRestore @("--exit-on-error", "--no-owner", "--dbname=$TestDatabaseUrl", $databaseFile)
if (Test-Path -LiteralPath $attachmentsFile) {
    New-Item -ItemType Directory -Force -Path $TestAttachmentPath | Out-Null
    Expand-Archive -LiteralPath $attachmentsFile -DestinationPath $TestAttachmentPath -Force
}
$previousDatabaseUrl = $env:DATABASE_URL
try {
    $env:DATABASE_URL = $TestDatabaseUrl
    Invoke-CreatorOSCommand $npm @("run", "db:check", "--prefix", $AppRoot)
} finally {
    $env:DATABASE_URL = $previousDatabaseUrl
}
Write-Host "Restore test completed. Start a compatible Creator OS revision against the test database and verify login, records, and attachment downloads before recording success."