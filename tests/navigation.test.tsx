import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";
import { ClientProfileProvider } from "@/components/client-profile-provider";
import { navigation } from "@/lib/navigation";

vi.mock("next/link", () => ({ default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={String(href)} {...props}>{children}</a> }));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("Creator OS navigation", () => {
  it("defines all workflow-first destinations, including historical work", () => {
    expect(navigation.map(({ label }) => label)).toEqual(["Overview", "Calendar", "Create", "Campaigns", "Brand Deals", "Products", "Archive", "Analytics", "Platforms"]);
  });

  it("renders the application shell and its content", () => {
    render(<ClientProfileProvider><AppShell><h1>Current workspace</h1></AppShell></ClientProfileProvider>);
    expect(screen.getByRole("heading", { name: "Current workspace" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Creator OS overview" })).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: "Overview" })[0]).toHaveAttribute("aria-current", "page");
  });
});
