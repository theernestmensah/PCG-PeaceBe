"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

function value(form: FormData, key: string, max = 5000) { return String(form.get(key) ?? "").trim().slice(0, max); }
function finish(type: "saved" | "error", message: string, anchor: string): never { redirect(`/admin/content?${type}=${encodeURIComponent(message)}#${anchor}`); }
function slugify(text: string) { return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").slice(0, 100); }

export async function createAnnouncement(form: FormData) {
  await requireAdmin();
  const title = value(form, "title", 200), body = value(form, "body");
  if (!title || !body) finish("error", "Add a title and announcement text.", "new-announcement");
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").insert({ title, body, status: value(form, "status") === "draft" ? "draft" : "published", is_pinned: form.get("is_pinned") === "on", publish_at: new Date().toISOString() });
  if (error) finish("error", "The announcement could not be saved.", "new-announcement");
  revalidatePath("/"); revalidatePath("/announcements");
  finish("saved", "Announcement saved.", "announcements");
}

export async function createEvent(form: FormData) {
  const admin = await requireAdmin();
  const title = value(form, "title", 200), description = value(form, "description"), venue = value(form, "venue", 300);
  const starts = new Date(value(form, "starts_at", 50)), ends = new Date(value(form, "ends_at", 50));
  if (!title || !description || Number.isNaN(starts.valueOf()) || Number.isNaN(ends.valueOf()) || ends < starts) finish("error", "Complete the event details and check the dates.", "new-event");
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({ title, slug: `${slugify(title)}-${Date.now().toString(36)}`, description, venue: venue || null, starts_at: starts.toISOString(), ends_at: ends.toISOString(), status: value(form, "status") === "draft" ? "draft" : "published", is_featured: form.get("is_featured") === "on", created_by: admin.id });
  if (error) finish("error", "The event could not be saved.", "new-event");
  revalidatePath("/"); revalidatePath("/events");
  finish("saved", "Event saved.", "events");
}

export async function createServiceTime(form: FormData) {
  await requireAdmin();
  const name = value(form, "name", 120), start_time = value(form, "start_time", 8), day = Number(value(form, "day_of_week", 1));
  if (!name || !/^\d{2}:\d{2}$/.test(start_time) || !Number.isInteger(day) || day < 0 || day > 6) finish("error", "Complete the service name, day and time.", "service-times");
  const supabase = await createClient();
  const { error } = await supabase.from("service_times").insert({ name, start_time, day_of_week: day, language: value(form, "language", 80) || null, notes: value(form, "notes", 500) || null });
  if (error) finish("error", "The service time could not be saved.", "service-times");
  revalidatePath("/"); revalidatePath("/visit");
  finish("saved", "Service time added.", "service-times");
}

export async function toggleContent(form: FormData) {
  await requireAdmin();
  const type = value(form, "type", 20), id = value(form, "id", 80), current = value(form, "current", 20);
  const table = type === "event" ? "events" : type === "announcement" ? "announcements" : null;
  if (!table || !/^[0-9a-f-]{36}$/.test(id)) finish("error", "That item could not be updated.", "content-status");
  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ status: current === "published" ? "draft" : "published" }).eq("id", id);
  if (error) finish("error", "That item could not be updated.", "content-status");
  revalidatePath("/"); revalidatePath(`/${table}`); revalidatePath("/admin/content");
  finish("saved", current === "published" ? "Item moved to drafts." : "Item published.", type === "event" ? "events" : "announcements");
}
