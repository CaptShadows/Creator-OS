"use server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/server";
import { recoverContent } from "@/lib/content/repository";
import { recoverCampaign } from "@/lib/campaigns/repository";
import { recoverProduct, recoverSample } from "@/lib/samples/repository";

const value=(form:FormData,name:string)=>String(form.get(name)||"");
function refresh(){revalidatePath("/archive");revalidatePath("/create");revalidatePath("/campaigns");revalidatePath("/products");}
export async function restoreContentAction(form:FormData){const owner=await requireOwner();await recoverContent(owner.id,value(form,"id"));refresh();}
export async function restoreCampaignAction(form:FormData){const owner=await requireOwner();await recoverCampaign(owner.id,value(form,"id"));refresh();}
export async function restoreProductAction(form:FormData){const owner=await requireOwner();await recoverProduct(owner.id,value(form,"id"));refresh();}
export async function restoreSampleAction(form:FormData){const owner=await requireOwner();await recoverSample(owner.id,value(form,"id"));refresh();}
