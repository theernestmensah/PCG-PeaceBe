import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getMember() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: person } = await supabase.from("people").select("id,first_name,last_name,preferred_name,email,phone,status,member_number").eq("auth_user_id", user.id).maybeSingle();
  return person ? { userId: user.id, ...person } : null;
}

export async function requireMember() {
  const member = await getMember();
  if (!member) redirect("/member/login");
  return member;
}

