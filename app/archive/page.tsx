import Link from "next/link";
import { requireOwner } from "@/lib/auth/server";
import { listOwnerContent } from "@/lib/content/repository";
import { listCampaigns } from "@/lib/campaigns/repository";
import { listProducts, listSamples } from "@/lib/samples/repository";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { restoreCampaignAction, restoreContentAction, restoreProductAction, restoreSampleAction } from "./actions";

export const dynamic="force-dynamic";
const categories=[{key:"all",label:"All"},{key:"content",label:"Content"},{key:"campaigns",label:"Campaigns"},{key:"products",label:"Products"}] as const;
type Category=(typeof categories)[number]["key"];

export default async function ArchivePage({searchParams}:{searchParams:Promise<{category?:string;q?:string}>}){
  const owner=await requireOwner(),query=await searchParams,category=(categories.some(x=>x.key===query.category)?query.category:"all") as Category,search=(query.q||"").trim().toLowerCase();
  const [content,campaigns,products,samples]=await Promise.all([listOwnerContent(owner.id,true),listCampaigns(owner.id,true),listProducts(owner.id,true),listSamples(owner.id,"all",true)]);
  const match=(value:string)=>!search||value.toLowerCase().includes(search);
  const productItems=[
    ...products.filter(x=>match(x.product.name)).map(x=>({id:x.product.id,name:x.product.name,meta:x.product.category||"Uncategorized",href:`/products/${x.product.id}`,action:restoreProductAction})),
    ...samples.filter(x=>match(`${x.productName} ${x.sample.sourcePlatform||""}`)).map(x=>({id:x.sample.id,name:x.productName,meta:x.sample.sourcePlatform||x.sample.status,href:`/products/samples/${x.sample.id}`,action:restoreSampleAction}))
  ];
  const sections=[
    {key:"content",label:"Content",items:content.filter(x=>match(x.title)).map(x=>({id:x.id,name:x.title,meta:x.status,href:`/create/${x.id}`,action:restoreContentAction}))},
    {key:"campaigns",label:"Campaigns",items:campaigns.filter(x=>match(`${x.campaign.name} ${x.brandName||""}`)).map(x=>({id:x.campaign.id,name:x.campaign.name,meta:x.brandName||x.campaign.status,href:`/campaigns/${x.campaign.id}`,action:restoreCampaignAction}))},
    {key:"products",label:"Products",items:productItems}
  ].filter(section=>category==="all"||section.key===category);
  const count=sections.reduce((sum,section)=>sum+section.items.length,0);
  return <section className="space-y-8"><PageHeader eyebrow="Archive" title="Past work, still easy to find." description="Open historical records without restoring them. Restore only when the work needs to become active again."/><form className="flex flex-wrap gap-3"><input type="hidden" name="category" value={category}/><label className="sr-only" htmlFor="archive-search">Search archive</label><input id="archive-search" name="q" defaultValue={query.q} placeholder="Search archived work…" className="min-h-12 flex-1 border border-[var(--line)] bg-white px-4"/><button className="primary-action min-h-12 px-5 text-sm font-bold">Search</button></form><nav aria-label="Archive categories" className="flex flex-wrap gap-2">{categories.map(item=><Link key={item.key} href={`/archive?category=${item.key}${query.q?`&q=${encodeURIComponent(query.q)}`:""}`} className={`min-h-11 border px-4 py-3 text-sm font-bold ${category===item.key?"border-[var(--accent-strong)] bg-[var(--blush)] text-[var(--accent-strong)]":"border-[var(--line)]"}`}>{item.label}</Link>)}</nav>{count===0?<EmptyState title="Nothing found" description={search?"Try another search or category.":"Archived records will appear here."}/>:sections.map(section=>section.items.length>0&&<section key={section.key} className="space-y-3"><h2 className="display-heading text-3xl">{section.label}</h2>{section.items.map(item=><article key={item.id} className="luxury-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-5"><div><h3 className="font-bold">{item.name}</h3><p className="mt-1 text-sm text-[var(--muted)]">{item.meta}</p></div><div className="flex items-center gap-3"><Link href={item.href} className="inline-flex min-h-11 items-center border border-[var(--line)] px-4 text-sm font-bold">Open</Link><form action={item.action}><input type="hidden" name="id" value={item.id}/><button className="min-h-11 px-3 text-sm font-bold text-[var(--accent-strong)]">Restore</button></form></div></article>)}</section>)}</section>;
}
