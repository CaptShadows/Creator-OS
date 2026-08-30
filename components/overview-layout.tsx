"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useClientProfile } from "./client-profile-provider";
import { ConfirmActionDialog } from "./confirm-action-dialog";
import {
  moveVisibleWidget,
  overviewWidgetIds,
  type OverviewLayoutItem,
  type OverviewProfile,
  type OverviewSize,
  type OverviewWidgetId,
} from "@/lib/overview/layout";
import {
  resetOverviewLayoutAction,
  saveOverviewLayoutAction,
} from "@/app/overview-actions";
const labels: Record<OverviewWidgetId, string> = {
  "summary-film": "Film summary",
  "summary-due": "Deadline summary",
  "summary-ready": "Posting summary",
  film: "Film Today",
  due: "Due / Overdue",
  samples: "Samples Needing Action",
  ready: "Ready to Post",
  deadlines: "Upcoming Deadlines",
  payments: "Outstanding Payments",
  "brand-deals": "Active Brand Deals",
  "brand-deal-due": "Brand Deliverables Due",
  "brand-deal-payments": "Brand Payments Due",
  "brand-deal-revenue": "Brand Deal Revenue",
  health: "Platform / Sync Health",
  revenue: "Revenue / Commission",
};
export function OverviewLayout({
  initial,
  widgets,
}: {
  initial: Record<OverviewProfile, OverviewLayoutItem[]>;
  widgets: Partial<Record<OverviewWidgetId, ReactNode>>;
}) {
  const { profile } = useClientProfile(),
    [layouts, setLayouts] = useState(initial),
    [editing, setEditing] = useState(false),
    [message, setMessage] = useState(""),
    [pending, startTransition] = useTransition(),
    layout = layouts[profile],
    visible = layout.filter((x) => x.visible);
  useEffect(() => setLayouts(initial), [initial]);
  const save = (next: OverviewLayoutItem[]) => {
    const previous = layout;
    setLayouts((x) => ({ ...x, [profile]: next }));
    startTransition(async () => {
      try {
        const f = new FormData();
        f.set("profile", profile);
        f.set("layout", JSON.stringify(next));
        await saveOverviewLayoutAction(f);
        setMessage("Layout saved.");
      } catch {
        setLayouts((x) => ({ ...x, [profile]: previous }));
        setMessage(
          "Could not save the layout. Your previous layout was restored.",
        );
      }
    });
  };
  const move = (id: OverviewWidgetId, delta: number) =>
    save(moveVisibleWidget(layout, id, delta));
  const update = (id: OverviewWidgetId, changes: Partial<OverviewLayoutItem>) =>
    save(layout.map((x) => (x.id === id ? { ...x, ...changes } : x)));
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {profile[0].toUpperCase() + profile.slice(1)} layout
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-11 border border-[var(--line)] px-4 text-sm font-bold"
            onClick={() => setEditing((x) => !x)}
          >
            {editing ? "Done customizing" : "Customize tiles"}
          </button>
          {editing && (
            <ConfirmActionDialog
              label="Reset layout"
              title="Reset this Overview layout?"
              name={`${profile} layout`}
              description="Only this profile will return to its default tile layout."
              action={resetOverviewLayoutAction}
              fields={{ profile }}
            />
          )}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? "Saving layout" : message}
      </p>
      {editing && (
        <details className="border border-[var(--line)] bg-white p-4">
          <summary className="cursor-pointer font-bold">Add tiles</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {layout
              .filter((x) => !x.visible)
              .map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className="border border-[var(--line)] px-3 py-2 text-sm"
                  onClick={() => update(x.id, { visible: true })}
                >
                  + {labels[x.id]}
                </button>
              ))}
          </div>
        </details>
      )}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        {visible.map((item, index) => (
          <div
            key={item.id}
            draggable={editing}
            onDragStart={(e) => e.dataTransfer.setData("text/widget", item.id)}
            onDragOver={(e) => editing && e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dragged = e.dataTransfer.getData(
                "text/widget",
              ) as OverviewWidgetId;
              const from = layout.findIndex((x) => x.id === dragged),
                to = layout.findIndex((x) => x.id === item.id);
              if (from >= 0 && to >= 0) {
                const next = [...layout],
                  row = next.splice(from, 1)[0];
                next.splice(to, 0, row);
                save(next);
              }
            }}
            className={
              item.size === "small"
                ? "xl:col-span-2"
                : item.size === "large"
                  ? "md:col-span-2 xl:col-span-6"
                  : "xl:col-span-3"
            }
          >
            {editing && (
              <div className="mb-2 flex flex-wrap items-center gap-2 border border-[var(--line)] bg-white p-2 text-xs">
                <strong className="mr-auto">{labels[item.id]}</strong>
                <button
                  type="button"
                  aria-label={`Move ${labels[item.id]} up`}
                  disabled={index === 0}
                  onClick={() => move(item.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move ${labels[item.id]} down`}
                  disabled={index === visible.length - 1}
                  onClick={() => move(item.id, 1)}
                >
                  ↓
                </button>
                <select
                  aria-label={`Size ${labels[item.id]}`}
                  value={item.size}
                  onChange={(e) =>
                    update(item.id, { size: e.target.value as OverviewSize })
                  }
                  disabled={profile === "mobile"}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <button
                  type="button"
                  onClick={() => update(item.id, { visible: false })}
                >
                  Hide
                </button>
              </div>
            )}
            {widgets[item.id]}
          </div>
        ))}
      </div>
      {editing && overviewWidgetIds.every((id) => !widgets[id]) && (
        <p>No tiles available.</p>
      )}
    </>
  );
}
