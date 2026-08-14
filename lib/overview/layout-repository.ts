import "server-only";
import { and,eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appSettings } from "@/db/schema";
import { defaultOverviewLayout,overviewProfiles,sanitizeOverviewLayout,type OverviewLayoutItem,type OverviewProfile } from "./layout";
const key=(profile:OverviewProfile)=>`overview.layout.${profile}`;
export async function getOverviewLayouts(owner:string){const rows=await getDatabase().db.select().from(appSettings).where(eq(appSettings.userId,owner));return Object.fromEntries(overviewProfiles.map(profile=>{const row=rows.find(x=>x.key===key(profile));return[profile,sanitizeOverviewLayout(row?.value,profile)]})) as Record<OverviewProfile,OverviewLayoutItem[]>;}
export async function saveOverviewLayout(owner:string,profile:OverviewProfile,value:unknown){const layout=sanitizeOverviewLayout(value,profile);await getDatabase().db.insert(appSettings).values({userId:owner,key:key(profile),value:layout}).onConflictDoUpdate({target:[appSettings.userId,appSettings.key],set:{value:layout,updatedAt:new Date()}});return layout;}
export async function resetOverviewLayout(owner:string,profile:OverviewProfile){await getDatabase().db.delete(appSettings).where(and(eq(appSettings.userId,owner),eq(appSettings.key,key(profile))));return defaultOverviewLayout(profile);}
