import { getCurrentOwner } from "@/lib/auth/server";
import { createAttachment, type AttachmentKind, type AttachmentTarget } from "@/lib/attachments/repository";
import { configuredAttachmentStorage } from "@/lib/attachments/storage";
import { AttachmentValidationError } from "@/lib/attachments/validation";

const targetTypes = new Set(["content","campaign","deliverable","product","sample"]);
function redirectBack(request:Request,value:FormDataEntryValue|null,status:string){const url=new URL(typeof value==="string"&&value.startsWith("/")?value:"/",request.url);url.searchParams.set("attachment",status);return Response.redirect(url,303);}

export async function POST(request:Request){
  const owner=await getCurrentOwner();if(!owner)return Response.json({error:"unauthorized"},{status:401});
  let form:FormData;try{form=await request.formData();}catch{return Response.json({error:"invalid_form"},{status:400});}
  const file=form.get("file"),targetType=String(form.get("targetType")),targetId=String(form.get("targetId")),kind=String(form.get("attachmentKind")||"pdf") as AttachmentKind;
  if(!(file instanceof File)||!targetTypes.has(targetType)||!targetId||!new Set(["pdf","video"]).has(kind))return Response.json({error:"invalid_upload"},{status:400});
  try{const {config,storage}=configuredAttachmentStorage(),maxBytes=kind==="video"?config.maxVideoBytes:config.maxBytes;if(file.size>maxBytes)throw new AttachmentValidationError(`The ${kind} exceeds the ${maxBytes}-byte upload limit.`);await createAttachment(owner.id,{type:targetType as AttachmentTarget["type"],id:targetId},{filename:file.name,mimeType:file.type,bytes:new Uint8Array(await file.arrayBuffer())},storage,maxBytes,kind);return redirectBack(request,form.get("returnTo"),"uploaded");}
  catch(error){const message=error instanceof AttachmentValidationError?error.message:error instanceof Error?error.message:"Upload failed";const url=new URL(typeof form.get("returnTo")==="string"&&String(form.get("returnTo")).startsWith("/")?String(form.get("returnTo")):"/",request.url);url.searchParams.set("attachmentError",message);return Response.redirect(url,303);}
}
