import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberLoginForm } from "@/components/member-login-form";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/public-page";
import { getMember } from "@/lib/member-auth";

export const metadata: Metadata = { title: "Member Sign In", description: "Sign in to the private Peace Be member area." };
export default async function MemberLoginPage() {
  if (await getMember()) redirect("/member");
  const enabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return <><PageIntro title="Your place in the church family." label="Member area" intro="See your groups, giving record, attendance and church information in one private place." /><Container><section className="section member-login-layout"><div><p className="section-label">Private member access</p><h2>One account for your church life</h2><p className="muted">Your church office must first link an authenticated account to your verified member record. Personal, giving and pastoral information is protected by database access rules.</p></div><MemberLoginForm enabled={enabled} /></section></Container></>;
}

