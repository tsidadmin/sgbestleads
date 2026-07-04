import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import DashNav from "@/components/DashNav";

// The auth guard reads cookies (a request-time API), so everything under it
// must render at request time. Wrapping the guarded shell in <Suspense>
// defers it — and all dashboard pages — past the static prerender.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="min-h-screen bg-paper">
      <DashNav email={user.email} />
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
