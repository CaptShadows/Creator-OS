import { describe,expect,it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root=join(process.cwd(),"deployment","windows");
const read=(name:string)=>readFileSync(join(root,name),"utf8");

describe("Windows production deployment",()=>{
  it("registers non-interactive startup and verified backup tasks",()=>{const script=read("Install-CreatorOS.ps1");expect(script).toContain('New-ScheduledTaskTrigger -AtStartup');expect(script).toContain('-UserId "SYSTEM"');expect(script).toContain('TaskName "CreatorOS-Backup"');expect(script).toContain('WindowStyle Hidden');expect(script).toContain('LastTaskResult')});
  it("preserves creator data when background tasks are removed",()=>{const script=read("Uninstall-CreatorOSService.ps1");expect(script).not.toMatch(/Remove-Item.+(?:DataRoot|attachments|backups|\.env)/i);expect(script).toContain("were preserved")});
  it("requires an explicit test database for restore verification",()=>{const script=read("Restore-Test-CreatorOS.ps1");expect(script).toContain('[Parameter(Mandatory)][string]$TestDatabaseUrl');expect(script).not.toContain('DATABASE_URL = $settings')});
  it("refuses long-lived bootstrap credentials",()=>expect(read("Install-CreatorOS.ps1")).toContain('Remove OWNER_EMAIL, OWNER_DISPLAY_NAME, and OWNER_PASSWORD'));
  it("supports the project Node engine and discovers standard PostgreSQL tools",()=>{expect(read("Install-CreatorOS.ps1")).toContain('$major -lt 22');expect(read("CreatorOS.Common.ps1")).toContain('PostgreSQL\\*\\bin')});
});