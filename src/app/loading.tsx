import { Container } from "@/components/ui/container";
export default function Loading() {
  return <Container className="py-20"><div role="status" aria-live="polite"><p className="text-muted">Loading church information…</p><div className="mt-8 h-10 w-3/4 rounded bg-surface" aria-hidden="true" /><div className="mt-5 h-36 rounded bg-surface" aria-hidden="true" /></div></Container>;
}
