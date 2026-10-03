"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

function text(form: FormData, key: string, max = 5000) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function optional(form: FormData, key: string, max = 5000) {
  return text(form, key, max) || null;
}

function amount(form: FormData, key: string) {
  const value = Number(form.get(key));
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}

function slug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").slice(0, 100);
}

function done(path: string, message: string, error?: boolean): never {
  revalidatePath(path);
  redirect(`${path}?${error ? "error" : "saved"}=${encodeURIComponent(message)}`);
}

export async function createPerson(form: FormData) {
  await requireAdmin();
  const first_name = text(form, "first_name", 100), last_name = text(form, "last_name", 100);
  if (!first_name || !last_name) done("/admin/members", "First and last name are required.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("people").insert({
    first_name, last_name, preferred_name: optional(form, "preferred_name", 100),
    phone: optional(form, "phone", 40), email: optional(form, "email", 320),
    status: text(form, "status", 20) || "visitor", joined_on: optional(form, "joined_on", 10),
    directory_visible: form.get("directory_visible") === "on",
  });
  done("/admin/members", error ? "Member record could not be saved." : "Member record saved.", Boolean(error));
}

export async function createMinistry(form: FormData) {
  await requireAdmin();
  const name = text(form, "name", 160);
  if (!name) done("/admin/ministry", "Enter a ministry name.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("groups").insert({
    name, short_name: optional(form, "short_name", 30), slug: slug(name),
    description: optional(form, "description"), group_kind: text(form, "group_kind", 30) || "ministry",
    is_public: form.get("is_public") === "on",
  });
  done("/admin/ministry", error ? "Ministry could not be saved." : "Ministry saved.", Boolean(error));
}

export async function createWorshipService(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 200), starts_at = text(form, "starts_at", 40);
  if (!title || !starts_at) done("/admin/worship", "Title and start time are required.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("worship_services").insert({ title, starts_at, venue: optional(form, "venue", 300), preacher: optional(form, "preacher", 200), bible_passage: optional(form, "bible_passage", 200) });
  done("/admin/worship", error ? "Service could not be scheduled." : "Worship service scheduled.", Boolean(error));
}

export async function createAlmanacEntry(form: FormData) {
  await requireAdmin();
  const entry_date = text(form, "entry_date", 10);
  if (!entry_date) done("/admin/worship", "Choose an Almanac date.", true);
  const readings = text(form, "readings").split(/[,\n]/).map(item => item.trim()).filter(Boolean);
  const supabase = await createClient();
  const { error } = await supabase.from("almanac_entries").upsert({
    entry_date, day_label: optional(form, "day_label", 160), theme: optional(form, "theme", 240), readings,
    memory_verse_reference: optional(form, "memory_verse_reference", 160), hymn_number: optional(form, "hymn_number", 40),
    hymn_title: optional(form, "hymn_title", 240), prayer_focus: optional(form, "prayer_focus"),
    source_note: optional(form, "source_note", 500), status: text(form, "status", 20) || "draft",
  }, { onConflict: "entry_date" });
  done("/admin/worship", error ? "Almanac entry could not be saved." : "Almanac entry saved.", Boolean(error));
}

export async function createFund(form: FormData) {
  await requireAdmin();
  const name = text(form, "name", 160);
  if (!name) done("/admin/finance", "Enter a fund name.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("funds").insert({ name, description: optional(form, "description", 1000) });
  done("/admin/finance", error ? "Fund could not be created." : "Fund created.", Boolean(error));
}

export async function recordGiving(form: FormData) {
  const admin = await requireAdmin();
  const value = amount(form, "amount"), fund_id = text(form, "fund_id", 40);
  if (!value || !fund_id) done("/admin/finance", "Choose a fund and enter a valid amount.", true);
  const status = text(form, "status", 20) === "confirmed" ? "confirmed" : "pending";
  const supabase = await createClient();
  const { error } = await supabase.from("giving_transactions").insert({
    fund_id, amount: value, status, payment_method: optional(form, "payment_method", 80), payment_reference: optional(form, "payment_reference", 200),
    ...(status === "confirmed" ? { confirmed_at: new Date().toISOString(), confirmed_by: admin.id } : {}),
  });
  done("/admin/finance", error ? "Transaction could not be recorded." : "Transaction recorded.", Boolean(error));
}

export async function createMeeting(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 200), scheduled_at = text(form, "scheduled_at", 40);
  if (!title || !scheduled_at) done("/admin/governance", "Meeting title and date are required.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("session_meetings").insert({ title, scheduled_at, venue: optional(form, "venue", 300), agenda: optional(form, "agenda"), status: text(form, "status", 20) || "scheduled" });
  done("/admin/governance", error ? "Meeting could not be saved." : "Session meeting saved.", Boolean(error));
}

export async function createActionItem(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 300);
  if (!title) done("/admin/governance", "Enter an action item.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("action_items").insert({ title, meeting_id: optional(form, "meeting_id", 40), due_on: optional(form, "due_on", 10) });
  done("/admin/governance", error ? "Action item could not be saved." : "Action item saved.", Boolean(error));
}

export async function createFollowup(form: FormData) {
  await requireAdmin();
  const subject = text(form, "subject", 240), person_id = text(form, "person_id", 40);
  if (!subject || !person_id) done("/admin/care", "Choose a person and enter a subject.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("pastoral_followups").insert({ person_id, subject, detail: optional(form, "detail"), due_on: optional(form, "due_on", 10), status: "open" });
  done("/admin/care", error ? "Follow-up could not be saved." : "Pastoral follow-up saved.", Boolean(error));
}

export async function createStory(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 200), body = text(form, "body");
  if (!title || !body) done("/admin/library", "Story title and body are required.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("stories").insert({ title, slug: slug(title), excerpt: optional(form, "excerpt", 500), body, status: text(form, "status", 20) || "draft" });
  done("/admin/library", error ? "Story could not be saved." : "Story saved.", Boolean(error));
}

export async function createDownload(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 200), external_url = text(form, "external_url", 1000);
  if (!title || !external_url.startsWith("https://")) done("/admin/library", "Enter a title and secure HTTPS link.", true);
  const supabase = await createClient();
  const { error } = await supabase.from("downloads").insert({ title, description: optional(form, "description", 1000), category: text(form, "category", 100) || "General", external_url, status: text(form, "status", 20) || "draft" });
  done("/admin/library", error ? "Resource could not be saved." : "Resource saved.", Boolean(error));
}

