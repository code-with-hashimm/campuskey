import { redirect } from "next/navigation";
import { StudentShell } from "@/components/student-shell";
import { isSupabaseConfigured } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isSupabaseConfigured()) {
    return (
      <StudentShell userName="Student" userEmail="Configure Supabase to enable auth">
        {children}
      </StudentShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,email")
    .eq("id", user.id)
    .maybeSingle();

  const userName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "Student";

  return (
    <StudentShell userName={userName} userEmail={profile?.email ?? user.email ?? ""}>
      {children}
    </StudentShell>
  );
}

