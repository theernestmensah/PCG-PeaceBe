"use client";
import { useActionState } from "react";
import { memberLogin, type MemberLoginState } from "@/app/member/actions";

const initialState: MemberLoginState = { error: "" };
export function MemberLoginForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(memberLogin, initialState);
  return <form action={action} className="contact-form member-login-form"><h2>Member sign in</h2><p className="muted">Use the email address connected to your church record.</p>{!enabled && <p className="form-error">The member portal will open after Supabase is connected.</p>}<label htmlFor="member-email">Email address</label><input id="member-email" name="email" type="email" autoComplete="username" required maxLength={320} disabled={!enabled} /><label htmlFor="member-password">Password</label><input id="member-password" name="password" type="password" autoComplete="current-password" required maxLength={200} disabled={!enabled} />{state.error && <p className="form-error" role="alert">{state.error}</p>}<button className="button button-primary" type="submit" disabled={!enabled || pending}>{pending ? "Signing in…" : "Sign in"}</button></form>;
}

