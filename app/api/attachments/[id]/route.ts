import { getCurrentOwner } from "@/lib/auth/server";
import { getAttachment } from "@/lib/attachments/repository";
import { configuredAttachmentStorage } from "@/lib/attachments/storage";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const owner=await getCurrentOwner();if(!owner)return Response.json({error:"unauthorized"},{status:401});
  const row=await getAttachment(owner.id,(await params).id);if(!row)return Response.json({error:"not_found_or_archived"},{status:404});
  try{const bytes=await configuredAttachmentStorage().storage.read(row.storageKey);return new Response(bytes,{headers:{"Content-Type":row.mimeType,"Content-Length":String(bytes.byteLength),"Content-Disposition":`inline; filename*=UTF-8''${encodeURIComponent(row.originalFilename)}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});}catch{return Response.json({error:"backing_file_missing"},{status:410});}
}
