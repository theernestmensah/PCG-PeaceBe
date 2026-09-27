"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global { interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void } } }
export function ContactForm({ type = "contact", enabled }: { type?: "contact" | "visitor"; enabled: boolean }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const result = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ready || !enabled || !widget.current || !window.turnstile) return;
    widgetId.current = window.turnstile.render(widget.current, { sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, theme: "light", size: "flexible", action: "church_contact", callback: (t: string) => setToken(t), "expired-callback": () => setToken(""), "error-callback": () => { setToken(""); setError("The security check could not load. Please refresh and try again."); setStatus("error"); } });
    return () => { if (widgetId.current) window.turnstile?.remove(widgetId.current); widgetId.current = null; };
  }, [ready, enabled]);
  useEffect(() => { if (status === "sent" || status === "error") result.current?.focus(); }, [status]);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (!values.email && !values.phone) { setError("Add your email address or phone number so we can reply."); setStatus("error"); return; }
    setStatus("sending"); setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, type, token }), signal: AbortSignal.timeout(25000) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Your message could not be sent. Please try again.");
      setStatus("sent"); form.reset();
    } catch (e) { setError(e instanceof Error && e.name !== "TimeoutError" ? e.message : "We couldn’t confirm delivery. Please contact the church before sending again."); setStatus("error"); }
    finally { setToken(""); if (widgetId.current) window.turnstile?.reset(widgetId.current); }
  }
  return <form className="contact-form" onSubmit={submit} aria-label={type === "visitor" ? "Plan a visit" : "Contact the church"}>
    <h2>{type === "visitor" ? "Plan your visit" : "Send a message"}</h2><p className="muted">Leave an email address or phone number so we can reply.</p>
    {!enabled && <div className="form-notice">Online messages are currently unavailable. Please use the church’s published contact details or speak with us in person.</div>}
    <fieldset disabled={!enabled || status === "sending"}><label htmlFor="contact-name">Your name <span>(required)</span></label><input id="contact-name" name="name" autoComplete="name" required maxLength={200} />
    <div className="form-columns"><div><label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={320} /></div><div><label htmlFor="contact-phone">Phone number</label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></div></div>
    <label htmlFor="contact-message">Your message <span>(required)</span></label><textarea id="contact-message" name="message" rows={5} required maxLength={5000} />
    <div className="honeypot" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <p className="form-privacy">Your details will be used by the church office to respond to this enquiry. Please avoid including sensitive personal information.</p>
    {enabled && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => { setError("The security check could not load. Refresh the page or contact the church directly."); setStatus("error"); }} /><div ref={widget} className="captcha" /></>}
    <button className="button button-primary" disabled={!enabled || !token || status === "sending"} type="submit">{status === "sending" ? "Sending…" : "Send message"}<span aria-hidden="true">↗</span></button></fieldset>
    <div ref={result} tabIndex={-1} role={status === "error" ? "alert" : "status"} className={status === "error" ? "form-error" : status === "sent" ? "form-success" : ""}>{status === "sent" ? "Thank you. Your message has been received by the church office." : error}</div>
  </form>;
}
