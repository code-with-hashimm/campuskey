import NotesClient from "./client";
import { verifyAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "Notes Management | Admin | CampusKey",
};

export default async function AdminNotesPage() {
  await verifyAdmin();

  // Fetch all notes with author names
  const { data: notes } = await supabaseAdmin
    .from("notes")
    .select(`
      *,
      users (
        name:first_name
      )
    `)
    .order("created_at", { ascending: false });

  // Get unique subjects for filter
  const subjects = Array.from(new Set((notes || []).map(n => n.subject))).sort();

  return (
    <div className="w-full">
      <NotesClient initialNotes={notes || []} subjects={subjects} />
    </div>
  );
}
