"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/server";
import {
  createBrandDealSchema,
  dealDeliverableSchema,
  dealLinkSchema,
  editBrandDealSchema,
} from "@/lib/brand-deals/contracts";
import {
  addDealDeliverable,
  archiveBrandDeal,
  createBrandDeal,
  deleteBrandDeal,
  linkDealEntity,
  migrateCampaignToBrandDeal,
  restoreBrandDeal,
  updateBrandDeal,
} from "@/lib/brand-deals/repository";
import {
  duplicateToken,
  duplicateWarningUrl,
  findDuplicates,
  validDuplicateToken,
} from "@/lib/duplicates/server";
const v = (f: FormData, n: string) => f.get(n);
export async function createBrandDealAction(f: FormData) {
  const o = await requireOwner(),
    x = createBrandDealSchema.parse({
      brandName: v(f, "brandName"),
      title: v(f, "title"),
      source: v(f, "source"),
      dealType: v(f, "dealType"),
    }),
    key = `${x.brandName} ${x.title}`,
    m = await findDuplicates(o.id, "campaign", key);
  if (
    m.length &&
    !validDuplicateToken(
      String(v(f, "duplicateToken") || ""),
      o.id,
      "campaign",
      key,
    )
  )
    redirect(
      duplicateWarningUrl(
        "/brand-deals",
        { ...x },
        duplicateToken(o.id, "campaign", key),
        m,
      ),
    );
  redirect(`/brand-deals/${await createBrandDeal(o.id, x)}`);
}
export async function updateBrandDealAction(f: FormData) {
  const o = await requireOwner(),
    raw = Object.fromEntries(f),
    x = editBrandDealSchema.parse(raw);
  await updateBrandDeal(o.id, x);
  revalidatePath(`/brand-deals/${x.id}`);
}
export async function addDealDeliverableAction(f: FormData) {
  const o = await requireOwner(),
    x = dealDeliverableSchema.parse(Object.fromEntries(f));
  await addDealDeliverable(o.id, x);
  revalidatePath(`/brand-deals/${x.brandDealId}`);
}
export async function linkDealEntityAction(f: FormData) {
  const o = await requireOwner(),
    x = dealLinkSchema.parse(Object.fromEntries(f));
  await linkDealEntity(o.id, x);
  revalidatePath(`/brand-deals/${x.brandDealId}`);
}
export async function archiveBrandDealAction(f: FormData) {
  const o = await requireOwner(),
    id = String(v(f, "id"));
  await archiveBrandDeal(o.id, id);
  redirect("/brand-deals");
}
export async function migrateCampaignToBrandDealAction(f: FormData) {
  const owner = await requireOwner();
  const campaignId = String(v(f, "campaignId"));
  redirect(
    `/brand-deals/${await migrateCampaignToBrandDeal(owner.id, campaignId)}?migrated=1`,
  );
}
export async function restoreBrandDealAction(f: FormData) {
  const o = await requireOwner();
  await restoreBrandDeal(o.id, String(v(f, "id")));
  revalidatePath("/brand-deals");
}
export async function deleteBrandDealAction(f: FormData) {
  const o = await requireOwner(),
    id = String(v(f, "id"));
  if (!(await deleteBrandDeal(o.id, id)))
    redirect(
      `/brand-deals/${id}?deleteError=Delete%20deal%20deliverables%20and%20attachments%20first.`,
    );
  redirect("/brand-deals?deleted=1");
}
