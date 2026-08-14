import "server-only";
import { createHmac,timingSafeEqual } from "node:crypto";
import { and,eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { campaigns,contents,platformAccounts,products } from "@/db/schema";
import { matchDuplicates,normalizeName } from "./matching";
export type DuplicateType="campaign"|"content"|"product"|"platform";
const secret=()=>process.env.DATABASE_URL||"creator-os-local-duplicate-confirmation";
export function duplicateToken(owner:string,type:DuplicateType,name:string){return createHmac("sha256",secret()).update(`${owner}\0${type}\0${normalizeName(name)}`).digest("base64url")}
export function validDuplicateToken(token:string|null,owner:string,type:DuplicateType,name:string){if(!token)return false;const expected=duplicateToken(owner,type,name),given=Buffer.from(token),wanted=Buffer.from(expected);return given.length===wanted.length&&timingSafeEqual(given,wanted)}
export async function findDuplicates(owner:string,type:DuplicateType,name:string,platform?:string){const db=getDatabase().db;if(type==="campaign")return matchDuplicates(name,(await db.select({id:campaigns.id,name:campaigns.name}).from(campaigns).where(eq(campaigns.ownerUserId,owner))).map(x=>({...x,href:`/campaigns/${x.id}`})));if(type==="content")return matchDuplicates(name,(await db.select({id:contents.id,name:contents.title}).from(contents).where(eq(contents.ownerUserId,owner))).map(x=>({...x,href:`/create/${x.id}`})));if(type==="product")return matchDuplicates(name,(await db.select({id:products.id,name:products.name}).from(products).where(eq(products.ownerUserId,owner))).map(x=>({...x,href:`/products/${x.id}`})));return matchDuplicates(name,(await db.select({id:platformAccounts.id,name:platformAccounts.displayName}).from(platformAccounts).where(and(eq(platformAccounts.ownerUserId,owner),eq(platformAccounts.platform,platform!)))).map(x=>({...x,href:`/platforms/${platform}`})))}
export function duplicateWarningUrl(path:string,values:Record<string,string>,token:string,matches:{id:string;name:string;href:string;reason:string}[]){const query=new URLSearchParams({...values,duplicateToken:token,duplicateMatches:JSON.stringify(matches)});return`${path}?${query}`}
