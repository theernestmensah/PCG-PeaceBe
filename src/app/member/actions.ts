"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MemberLoginState = { error: string };
export async function memberLogin(_state: MemberLoginState, formData: FormData): Promise<MemberLoginState> {
  const email = String(formData.get("email") ?? "").trim(), password = String(formData.get("password") ?? "");
  if (!email || !password || email.length > 320 || password.length > 200) return { error: "Enter your email address and password." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "The email address or password is incorrect." };
  const { data: person } = await supabase.from("people").select("id").eq("auth_user_id", data.user.id).maybeSingle();
  if (!person) { await supabase.auth.signOut(); return { error: "This account is not linked to a congregation member record." }; }
  redirect("/member");
}

export async function memberLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/member/login");
}

