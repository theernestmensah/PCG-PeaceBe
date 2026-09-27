export type ContactInput = { type: "contact" | "visitor"; name: string; email: string | null; phone: string | null; message: string; token: string };
export function validateContact(value: unknown): { data: ContactInput; error?: never } | { error: string; data?: never } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Please complete the message form." };
  const v = value as Record<string, unknown>;
  const string = (key: string) => typeof v[key] === "string" ? v[key].trim() : "";
  const name = string("name"), email = string("email"), phone = string("phone"), message = string("message"), token = string("token");
  if (string("website")) return { error: "Your message could not be accepted." };
  if (v.type !== "contact" && v.type !== "visitor") return { error: "Please use the contact or visitor form." };
  if (!name || name.length > 200) return { error: "Enter your name (up to 200 characters)." };
  if (!email && !phone) return { error: "Enter an email address or phone number so we can reply." };
  if (email && (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { error: "Enter a valid email address." };
  if (phone && (phone.length > 40 || !/^[+\d\s().-]{7,40}$/.test(phone) || phone.replace(/\D/g, "").length < 7)) return { error: "Enter a valid phone number." };
  if (!message || message.length > 5000) return { error: "Enter a message (up to 5,000 characters)." };
  if (!token || token.length > 2048) return { error: "Please complete the security check and try again." };
  return { data: { type: v.type, name, email: email || null, phone: phone || null, message, token } };
}
