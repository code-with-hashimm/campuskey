import { StudentShell } from "@/components/student-shell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // If user is not logged in, redirect them to the login page
  if (!user) {
    redirect("/login");
  }

  const userName = `${user.firstName} ${user.lastName}`;
  const userEmail = user.email;

  return (
    <StudentShell userName={userName} userEmail={userEmail}>
      {children}
    </StudentShell>
  );
}

