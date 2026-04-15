import StudentNotesClient from "./client";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "My Notes | CampusKey",
};

export default async function StudentNotesPage() {
  let notes: any[] = [];
  let errorMsg: string | null = null;

  try {
    const { data, error } = await supabaseAdmin
      .from("notes")
      .select(`
        id,
        title,
        subject,
        content,
        attachment_url,
        views,
        created_at,
        users (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      errorMsg = error.message;
    } else if (data) {
      // Map the data to include authorName correctly
      notes = data.map((note: any) => ({
        ...note,
        authorName: note.users ? `${note.users.first_name} ${note.users.last_name}` : "Unknown Student"
      }));
    }
  } catch (err: any) {
    console.error("[CRITICAL ERROR] Failed to fetch notes:", err);
    errorMsg = err.message || "An unexpected error occurred while fetching notes.";
  }

  // Get unique subjects for the filter
  const subjects = Array.from(new Set(notes.map(n => n.subject))).filter(Boolean);

  return (
    <div className="w-full">
      <StudentNotesClient 
        initialNotes={notes} 
        subjects={subjects}
        initialBookmarks={[]}
        error={errorMsg}
      />
    </div>
  );
}
