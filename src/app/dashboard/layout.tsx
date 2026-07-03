import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import DashNav from "@/components/DashNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="min-h-screen bg-paper">
      <DashNav email={user.email} />
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
