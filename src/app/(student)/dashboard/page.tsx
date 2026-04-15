import Link from "next/link";
import CommunityCard from "@/components/community-card";
import { supabaseAdmin } from "@/lib/supabase";
import MiniNoteCard from "@/components/mini-note-card";

type Note = {
  id: string;
  title: string;
  subject: string | null;
  attachment_url: string | null;
  created_at: string;
};

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
};

// --- Helper Functions ---

function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatEventDate(dateString: string | null) {
  if (!dateString) return "Date TBD";
  const date = new Date(dateString);
  const now = new Date();

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// --- Main Page Component ---

export default async function DashboardPage() {
  // Fetch Upcoming Events
  const { data: eventsData } = await supabaseAdmin
    .from("events")
    .select("id, title, description, event_date")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(2);

  const upcomingEvents: Event[] = eventsData || [];

  // Fetch Recent Notes (Top 4)
  const { data: notesData } = await supabaseAdmin
    .from("notes")
    .select("id, title, subject, attachment_url, created_at")
    .order("created_at", { ascending: false })
    .limit(4);

  const recentNotes: Note[] = notesData || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Card 1: Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-2xl text-gray-900">Get Free Certificate</h3>
              <p className="text-sm text-gray-500">Learn, Grow, and Get Certified — All in One Experience.</p>
            </div>

            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">No upcoming events. Stay tuned!</p>
                </div>
              ) : (
                upcomingEvents.map((event, i, arr) => (
                  <div key={event.id} className={`pb-4 ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {event.event_date ? (new Date(event.event_date) > new Date() ? "Upcoming" : "Started") : "Upcoming"}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 line-clamp-1" title={event.title}>{event.title}</h4>
                    <p className="text-sm text-gray-500">{formatEventDate(event.event_date)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/events"
              className="block w-full text-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              See More Events
            </Link>
          </div>
        </div>

        {/* Card 2: Community Group */}
        <CommunityCard />
      </div>

      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Notes</h3>
            <p className="text-sm text-slate-500">Latest study materials shared by your peers.</p>
          </div>
          <Link
            href="/dashboard/notes"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all notes →
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No notes available yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Check back soon for new study materials!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentNotes.map((note) => (
              <MiniNoteCard
                key={note.id}
                id={note.id}
                title={note.title}
                subject={note.subject ?? "General"}
                attachment_url={note.attachment_url}
                relativeTime={getRelativeTime(note.created_at)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
