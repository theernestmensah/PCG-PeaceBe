import Link from "next/link";
import { memberLogout } from "@/app/member/actions";
import { Container } from "@/components/ui/container";
import { dateLabel } from "@/lib/content";
import { requireMember } from "@/lib/member-auth";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });
export default async function MemberDashboardPage() {
  const member = await requireMember(); const supabase = await createClient();
  const [groups, attendance, giving] = await Promise.all([
    supabase.from("ministry_memberships").select("joined_on,groups(name,slug)").eq("person_id", member.id).eq("is_active", true),
    supabase.from("attendance_records").select("state,checked_in_at,worship_services(title,starts_at)").eq("person_id", member.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("giving_transactions").select("amount,status,received_at,funds(name)").eq("person_id", member.id).eq("status", "confirmed").order("received_at", { ascending: false }).limit(10),
  ]);
  return <><section className="member-hero"><Container><div><p className="section-label">Member area</p><h1>Welcome, {member.preferred_name || member.first_name}.</h1><p>Your private view of life at Peace Be Congregation.</p></div><form action={memberLogout}><button className="button button-secondary" type="submit">Sign out</button></form></Container></section><Container><section className="section member-dashboard"><article><p className="section-label">Your profile</p><h2>{member.first_name} {member.last_name}</h2><dl><dt>Member number</dt><dd>{member.member_number || "Not assigned"}</dd><dt>Status</dt><dd className="capitalize">{member.status}</dd><dt>Contact</dt><dd>{member.phone || member.email || "Ask the church office to update this record"}</dd></dl><Link className="text-link" href="/contact">Request a profile change ↗</Link></article><article><p className="section-label">Your groups</p><h2>Where you belong</h2>{groups.data?.length ? <ul className="member-list">{groups.data.map((item, index) => <li key={index}>Active ministry membership</li>)}</ul> : <p className="muted">No active group membership has been recorded yet.</p>}<Link className="text-link" href="/church-family">Explore church groups ↗</Link></article><article><p className="section-label">Recent giving</p><h2>Your confirmed record</h2>{giving.data?.length ? <ul className="member-list">{giving.data.map((item, index) => <li key={index}><strong>{money.format(Number(item.amount))}</strong><span>{dateLabel(item.received_at)}</span></li>)}</ul> : <p className="muted">No confirmed giving has been linked to this account.</p>}</article><article><p className="section-label">Attendance</p><h2>Recent services</h2>{attendance.data?.length ? <ul className="member-list">{attendance.data.map((item, index) => <li key={index}><strong className="capitalize">{item.state}</strong><span>{item.checked_in_at ? dateLabel(item.checked_in_at) : "Recorded by church office"}</span></li>)}</ul> : <p className="muted">No attendance record has been linked to this account.</p>}</article></section></Container></>;
}

