"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/library", label: "Library" },
  { href: "/admin/members", label: "People" },
  { href: "/admin/ministry", label: "Ministry" },
  { href: "/admin/worship", label: "Worship" },
  { href: "/admin/care", label: "Care" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/governance", label: "Governance" },
  { href: "/admin/communications", label: "Communications" },
];
export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="admin-page admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin"><Image src="/images/pcg-crest.png" alt="" width={211} height={281} className="admin-crest" /><span>Peace Be<small>Church office</small></span></Link><nav aria-label="Church office">{nav.map(item => <Link href={item.href} key={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}<Link href="/" target="_blank">View website ↗</Link></nav><div className="admin-account"><span>{email}</span><form action={logout}><button type="submit">Sign out</button></form></div></aside><div className="admin-workspace">{children}</div></div>;
}
