import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [people, followups, actions, messages, recent] = await Promise.all([
    supabase.from("people").select("id", { count: "exact", head: true }),
    supabase.from("pastoral_followups").select("id", { count: "exact", head: true }).neq("status", "complete"),
    supabase.from("action_items").select("id", { count: "exact", head: true }).neq("status", "complete"),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_handled", false),
    supabase.from("contact_messages").select("id,name,type,message,created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  const metrics = [["People", people.count ?? 0], ["Open care follow-ups", followups.count ?? 0], ["Session actions", actions.count ?? 0], ["Open enquiries", messages.count ?? 0]];
  return <main className="admin-main"><header className="admin-page-header"><div><p>{new Intl.DateTimeFormat("en-GH", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Accra" }).format(new Date())}</p><h1>Good to see you.</h1><span>Here’s what needs attention across the congregation.</span></div><Link className="admin-button admin-button-primary" href="/admin/content#new-announcement">Publish an update</Link></header><section className="admin-metrics" aria-label="Church overview">{metrics.map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section><div className="admin-dashboard-grid"><section className="admin-section"><div className="admin-section-title"><h2>Recent enquiries</h2></div>{recent.data?.length ? <div className="admin-list">{recent.data.map(item => <article key={item.id}><div><strong>{item.name}</strong><span>{item.type === "visitor" ? "Visit enquiry" : "Contact message"}</span></div><p>{item.message || "No message supplied"}</p><time>{new Intl.DateTimeFormat("en-GH", { day: "numeric", month: "short", timeZone: "Africa/Accra" }).format(new Date(item.created_at))}</time></article>)}</div> : <div className="admin-empty"><h3>No enquiries waiting</h3><p>New contact and visit messages will appear here.</p></div>}</section><aside className="admin-section admin-quick-actions"><h2>Quick actions</h2><Link href="/admin/members">Add a member <span>→</span></Link><Link href="/admin/worship">Plan worship <span>→</span></Link><Link href="/admin/finance">Record giving <span>→</span></Link><Link href="/admin/governance">Schedule Session <span>→</span></Link><Link href="/admin/content#new-announcement">Publish a notice <span>→</span></Link></aside></div></main>;
}
