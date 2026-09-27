import { publicDatabase } from "@/lib/content";
import { contactEnabled } from "@/lib/contact-config";
import { validateContact } from "@/lib/contact-validation";

export async function POST(request: Request) {
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  if (request.headers.get("origin") !== new URL(request.url).origin) return fail("Please send your message through this website.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return fail("Unsupported message format.", 415);
  if (Number(request.headers.get("content-length")) > 20000) return fail("Your message is too long.", 413);
  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail("Please complete the message form.", 400);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 20000) { await reader.cancel(); return fail("Your message is too long.", 413); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    raw = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return fail("Please check your message and try again.", 400); }
  const input = validateContact(raw);
  if (input.error) return fail(input.error, 400);
  if (!contactEnabled()) return fail("Online messages are currently unavailable. Please contact the church directly.", 503);
  const data = input.data!;
  try {
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: data.token }), signal: AbortSignal.timeout(8000) });
    const captcha = await verify.json();
    if (!verify.ok || !captcha.success || captcha.action !== "church_contact" || captcha.hostname !== new URL(request.url).hostname) return fail("The security check expired. Please complete it again.", 400);
    const message = {
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    };
    const saved = await publicDatabase()!.from("contact_messages").insert(message);
    if (saved.error) { console.error("Contact message could not be stored"); return fail("Your message could not be saved. Please try again later.", 503); }
    // Receipt is based on durable database storage; email is a supplementary notification.
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.CHURCH_OFFICE_EMAIL) {
      try {
        const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [process.env.CHURCH_OFFICE_EMAIL], subject: data.type === "visitor" ? "New visit enquiry — Peace Be" : "New website message — Peace Be", text: `Name: ${data.name}\nEmail: ${data.email || "Not supplied"}\nPhone: ${data.phone || "Not supplied"}\n\n${data.message}`, ...(data.email ? { reply_to: data.email } : {}) }), signal: AbortSignal.timeout(5000) });
        if (!response.ok) console.error("Contact email notification failed; message is stored");
      } catch { console.error("Contact email notification unavailable; message is stored"); }
    }
    return Response.json({ ok: true });
  } catch { return fail("We couldn’t confirm delivery. Please contact the church before sending again.", 503); }
}
