"use client";
import { ErrorState } from "@/components/ui/error-state";
export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <section className="mx-auto max-w-2xl py-20"><ErrorState title="Creator OS hit a snag." description="Your work has not been intentionally changed. Try loading this view again." retry={reset} /></section>; }
