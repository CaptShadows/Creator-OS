import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ClientProfileProvider, resolveAutomaticProfile, useClientProfile } from "@/components/client-profile-provider";
import { ProfileControl } from "@/components/profile-control";

function Probe() { const { profile, preference } = useClientProfile(); return <output>{preference}:{profile}</output>; }
function Subject() { return <ClientProfileProvider><ProfileControl /><Probe /></ClientProfileProvider>; }

describe("client profiles", () => {
  beforeEach(() => window.localStorage.clear());

  it("selects automatic profiles from viewport width", () => {
    expect(resolveAutomaticProfile(390)).toBe("mobile");
    expect(resolveAutomaticProfile(800)).toBe("tablet");
    expect(resolveAutomaticProfile(1440)).toBe("desktop");
    expect(resolveAutomaticProfile(1920)).toBe("desktop");
    expect(resolveAutomaticProfile(3840)).toBe("desktop");
  });

  it("persists a manual browser-only override across remounts", async () => {
    const first = render(<Subject />);
    fireEvent.change(screen.getByLabelText("Display profile"), { target: { value: "wall" } });
    await waitFor(() => expect(screen.getByText("wall:wall")).toBeInTheDocument());
    expect(window.localStorage.getItem("creator-os-client-profile")).toBe("wall");
    first.unmount();
    render(<Subject />);
    await waitFor(() => expect(screen.getByText("wall:wall")).toBeInTheDocument());
  });
});
