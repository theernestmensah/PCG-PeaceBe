import { requireMember } from "@/lib/member-auth";
export default async function MemberLayout({ children }: { children: React.ReactNode }) { await requireMember(); return children; }

