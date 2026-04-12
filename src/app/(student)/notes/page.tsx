import StudentNotesClient from "./client";

export const metadata = {
  title: "My Notes | CampusKey",
};

export default async function StudentNotesPage() {
  return (
    <div className="w-full">
      <StudentNotesClient 
        initialNotes={[]} 
        subjects={[]}
        initialBookmarks={[]}
      />
    </div>
  );
}
