"use server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/server";
import { overviewProfiles } from "@/lib/overview/layout";
import { resetOverviewLayout,saveOverviewLayout } from "@/lib/overview/layout-repository";
export async function saveOverviewLayoutAction(form:FormData){const owner=await requireOwner(),profile=String(form.get("profile"));if(!overviewProfiles.includes(profile as never))throw new Error("Invalid profile");await saveOverviewLayout(owner.id,profile as never,JSON.parse(String(form.get("layout"))));revalidatePath("/");}
export async function resetOverviewLayoutAction(form:FormData){const owner=await requireOwner(),profile=String(form.get("profile"));if(!overviewProfiles.includes(profile as never))throw new Error("Invalid profile");await resetOverviewLayout(owner.id,profile as never);revalidatePath("/");}
