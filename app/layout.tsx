import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Creator OS", template: "%s · Creator OS" },
  description: "A calm, LAN-first creator operations workspace.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f5f2" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>;
}
