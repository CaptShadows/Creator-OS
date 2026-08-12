import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataList } from "@/components/ui/data-list";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

describe("shared UI primitives", () => {
  it("renders accessible headers, statuses, lists, and tables", () => {
    render(<><PageHeader eyebrow="Campaigns" title="Work in progress" /><StatusBadge tone="warning">Due soon</StatusBadge><DataList label="Deliverables" items={[{ id: "1", title: "Video", status: <StatusBadge>Draft</StatusBadge> }]} /><DataTable caption="Payments" headers={["Brand", "Amount"]} rows={[["Example", "$100"]]} /></>);
    expect(screen.getByRole("heading", { name: "Work in progress" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Deliverables" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Payments" })).toBeInTheDocument();
  });

  it("renders explicit empty and recoverable error states", () => {
    const retry = vi.fn();
    render(<><EmptyState title="Nothing here" description="Add the first record." /><ErrorState title="Could not load" description="Try again." retry={retry} /></>);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    screen.getByRole("button", { name: "Try again" }).click();
    expect(retry).toHaveBeenCalledOnce();
  });
});
