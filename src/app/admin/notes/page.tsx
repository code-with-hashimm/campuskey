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
      id,
      title,
      subject,
      semester,
      attachment_url,
      created_at,
      uploaded_by,
      users (
        name:first_name
      )
    `)
    .order("created_at", { ascending: false });

  const formattedNotes = ((notes || []).map((note: any) => {
    const userObj = Array.isArray(note.users) ? note.users[0] : note.users;

    return {
      ...note,
      author_id: note.uploaded_by,
      users: {
        name: userObj?.name || "Unknown",
      },
    };
  })) as Parameters<typeof NotesClient>[0]["initialNotes"];

  // Get unique subjects for filter
  const subjects = Array.from(new Set(formattedNotes.map((n) => n.subject))).sort();

  return (
    <div className="w-full">
      <NotesClient initialNotes={formattedNotes} subjects={subjects} />
    </div>
  );
}
