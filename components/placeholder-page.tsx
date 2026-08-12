import { requireOwner } from "@/lib/auth/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TouchButton } from "@/components/ui/touch-button";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  focus: readonly string[];
};

export async function PlaceholderPage({ eyebrow, title, description, focus }: PlaceholderPageProps) {
  await requireOwner();
  return (
    <section className="space-y-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="profile-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {focus.map((item) => (
          <SurfaceCard key={item} className="min-h-32">
            <div className="mb-4 h-px w-9 bg-[var(--metal-accent)]" />
            <h2 className="font-semibold">{item}</h2>
            <p className="profile-density-secondary mt-2 text-sm leading-6 text-[var(--muted)]">This workspace arrives in a later Creator OS phase.</p>
          </SurfaceCard>
        ))}
      </div>
      <EmptyState title="No records yet" description="This route is ready for its feature workflow; no placeholder business data has been invented." action={<TouchButton href="/">Back to today</TouchButton>} />
    </section>
  );
}
