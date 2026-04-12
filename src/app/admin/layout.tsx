import { AdminShell } from "@/components/admin-shell";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // If user is not logged in OR role is not admin, hide the route entirely with notFound()
  if (!user || user.role !== "admin") {
    notFound();
  }

  const userName = `${user.firstName} ${user.lastName}`;
  const userEmail = user.email;

  return (
    <AdminShell userName={userName} userEmail={userEmail}>
      {children}
    </AdminShell>
  );
}
