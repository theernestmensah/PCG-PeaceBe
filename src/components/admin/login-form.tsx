"use client";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: "" };
export function LoginForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(login, initialState);
  return <form action={action} className="admin-login-form">
    {!enabled && <p className="admin-error">Connect Supabase in <code>.env.local</code> before signing in.</p>}
    <label htmlFor="admin-email">Email address</label>
    <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={320} disabled={!enabled} />
    <label htmlFor="admin-password">Password</label>
    <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} disabled={!enabled} />
    {state.error && <p className="admin-error" role="alert">{state.error}</p>}
    <button className="admin-button admin-button-primary" type="submit" disabled={!enabled || pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
