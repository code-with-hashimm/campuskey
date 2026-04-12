import Link from "next/link";
import CommunityCard from "@/components/community-card";
import { supabase } from "@/lib/supabase";

type Note = {
  id: string;
  title: string;
  subject: string | null;
  content: string | null;
  created_at: string | null;
  file_size?: number | null;
};

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
  is_active: boolean;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Recently added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatEventDate(dateString: string | null) {
  if (!dateString) return "Date TBD";
  const date = new Date(dateString);
  const now = new Date();
  
  // Simple "Tomorrow" logic
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

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) {
    return "PDF";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DashboardPage() {
  // Fetch Upcoming Events
  const { data: eventsData } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(2);

  const upcomingEvents: Event[] = eventsData || [];

  // Fetch Recent Notes
  const { data: notesData } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  const recentNotes: Note[] = notesData || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Card 1: Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900">Get Free Certificate</h3>
              <p className="text-sm text-gray-500">Learn, Grow, and Get Certified — All in One Experience.</p>
            </div>

            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">No upcoming events scheduled</p>
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

      <section className="rounded-[32px] border border-primary/12 bg-white/92 p-6 shadow-xl shadow-primary/8 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/70">
              Recent Notes
            </p>
          </div>
          <Link
            href="/notes"
            className="text-sm font-semibold text-primary hover:text-primary-strong"
          >
            View all notes
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-primary/20 bg-primary-soft/45 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              No notes available yet
            </p>
            <p className="mt-2 text-sm text-muted">
              Once notes are uploaded, they&apos;ll appear here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentNotes.map((note) => (
              <article
                key={note.id}
                className="rounded-[28px] border border-primary/10 bg-[#fcfbff] p-5 shadow-sm shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {note.subject ?? "General"}
                  </span>
                  <span className="text-xs font-medium text-muted">
                    {formatFileSize(note.file_size)}
                  </span>
                </div>

                <h4 className="mt-4 text-xl font-semibold text-foreground line-clamp-1" title={note.title}>
                  {note.title}
                </h4>

                <p className="mt-4 text-sm text-muted line-clamp-2">
                  {note.content}
                </p>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-muted">{formatDate(note.created_at)}</span>
                  <Link
                    href="/notes"
                    className="font-semibold text-primary hover:text-primary-strong"
                  >
                    Open library
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

