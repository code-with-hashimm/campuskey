import UserTableClient from "./UserTableClient";
import { verifyAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "User Management | Admin | CampusKey",
};

export default async function AdminUsersPage() {
  await verifyAdmin();

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, first_name, last_name, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="w-full space-y-6">
      <UserTableClient users={users || []} />
    </div>
  );
}
