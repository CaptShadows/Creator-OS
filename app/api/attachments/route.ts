import { getCurrentOwner } from "@/lib/auth/server";
import { createAttachment, type AttachmentKind, type AttachmentTarget } from "@/lib/attachments/repository";
import { configuredAttachmentStorage } from "@/lib/attachments/storage";
import { AttachmentValidationError } from "@/lib/attachments/validation";

const targetTypes = new Set(["content","campaign","deliverable","product","sample"]);
function redirectBack(value:FormDataEntryValue|null,status:string){
  const raw=typeof value==="string"&&value.startsWith("/")&&!value.startsWith("//")?value:"/";
  const [pathname,query=""]=raw.split("?",2);
  const params=new URLSearchParams(query);
  params.set("attachment",status);
  const location=`${pathname}?${params.toString()}`;
  return new Response(null,{status:303,headers:{Location:location}});
}
function redirectError(value:FormDataEntryValue|null,message:string){
  const raw=typeof value==="string"&&value.startsWith("/")&&!value.startsWith("//")?value:"/";
  const [pathname,query=""]=raw.split("?",2);
  const params=new URLSearchParams(query);
  params.set("attachmentError",message);
  return new Response(null,{status:303,headers:{Location:`${pathname}?${params.toString()}`}});
}

export async function POST(request:Request){
  const owner=await getCurrentOwner();if(!owner)return Response.json({error:"unauthorized"},{status:401});
  let form:FormData;try{form=await request.formData();}catch{return Response.json({error:"invalid_form"},{status:400});}
  const file=form.get("file"),targetType=String(form.get("targetType")),targetId=String(form.get("targetId")),kind=String(form.get("attachmentKind")||"pdf") as AttachmentKind;
  if(!(file instanceof File)||!targetTypes.has(targetType)||!targetId||!new Set(["pdf","video"]).has(kind))return Response.json({error:"invalid_upload"},{status:400});
  try{const {config,storage}=configuredAttachmentStorage(),maxBytes=kind==="video"?config.maxVideoBytes:config.maxBytes;if(file.size>maxBytes)throw new AttachmentValidationError(`The ${kind==="video"?"video":"attachment"} exceeds the ${maxBytes}-byte upload limit.`);await createAttachment(owner.id,{type:targetType as AttachmentTarget["type"],id:targetId},{filename:file.name,mimeType:file.type,bytes:new Uint8Array(await file.arrayBuffer())},storage,maxBytes,kind);return redirectBack(form.get("returnTo"),"uploaded");}
  catch(error){const message=error instanceof AttachmentValidationError?error.message:error instanceof Error?error.message:"Upload failed";return redirectError(form.get("returnTo"),message);}
}
