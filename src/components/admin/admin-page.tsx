export function AdminNotice({ params }: { params: Record<string, string | string[] | undefined> }) {
  const saved = typeof params.saved === "string" ? params.saved : "";
  const error = typeof params.error === "string" ? params.error : "";
  return saved || error ? <div className={error ? "admin-flash admin-flash-error" : "admin-flash"} role={error ? "alert" : "status"}>{error || saved}</div> : null;
}

export function AdminEmpty({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="admin-empty"><h3>{title}</h3><p>{children}</p></div>;
}

