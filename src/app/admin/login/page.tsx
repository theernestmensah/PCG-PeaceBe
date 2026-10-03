import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Church Office Sign In", robots: { index: false, follow: false } };
export default async function AdminLoginPage() {
  const enabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (enabled && await getAdmin()) redirect("/admin");
  return <div className="admin-page admin-auth-page"><main className="admin-auth-panel"><Link className="admin-brand" href="/"><Image src="/images/pcg-crest.png" alt="" width={211} height={281} className="admin-crest" /><span>Peace Be Congregation<small>Church office</small></span></Link><div><p className="admin-overline">Authorised staff only</p><h1>Welcome back.</h1><p>Sign in to publish church updates and manage the public website.</p></div><LoginForm enabled={enabled} /><Link className="admin-back-link" href="/">← Return to the public website</Link></main><aside className="admin-auth-aside"><blockquote>“Let all things be done decently and in order.”</blockquote><cite>1 Corinthians 14:40</cite></aside></div>;
}
