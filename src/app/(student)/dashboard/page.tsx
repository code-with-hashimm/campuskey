import Link from "next/link";
import { isSupabaseConfigured } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";

type Note = {
  id: string;
  title: string;
  subject: string | null;
  semester: number | null;
  year: number | null;
  uploaded_at: string | null;
  file_size: number | null;
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

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "PDF";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DashboardPage() {
  let error: { message?: string } | null = null;
  let recentNotes: Note[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const result = await supabase
      .from("question_papers")
      .select("id,title,subject,semester,year,uploaded_at,file_size")
      .eq("is_approved", true)
      .order("uploaded_at", { ascending: false })
      .limit(6);

    error = result.error;
    recentNotes = (result.data ?? []) as Note[];
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] bg-primary p-6 text-white shadow-2xl shadow-primary/20 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
            Dashboard
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Recent Notes, ready when you are.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
            Browse the latest approved papers from one place and keep up with
            your academic flow across notes, events, and upcoming study tools.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/notes"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm hover:-translate-y-0.5"
            >
              Browse all notes
            </Link>
            <Link
              href="/events"
              className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Explore events
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-primary/12 bg-white/90 p-6 shadow-lg shadow-primary/8 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/70">
            Quick View
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] bg-primary-soft p-5">
              <p className="text-sm text-primary">Approved notes loaded</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {recentNotes.length}
              </p>
            </div>
            <div className="rounded-[24px] border border-primary/10 p-5">
              <p className="text-sm text-muted">Student surfaces</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                Dashboard, PYQ, Events, Chatbot
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-primary/12 bg-white/92 p-6 shadow-xl shadow-primary/8 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/70">
              Recent Notes
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">
              Latest approved papers
            </h3>
          </div>
          <Link
            href="/notes"
            className="text-sm font-semibold text-primary hover:text-primary-strong"
          >
            View all notes
          </Link>
        </div>

        {!isSupabaseConfigured() ? (
          <div className="mt-6 rounded-[24px] border border-primary/15 bg-primary-soft px-5 py-4 text-sm text-primary-strong">
            Add your Supabase values in `.env.local` to load the latest approved
            notes from `question_papers`.
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Failed to load recent notes. Please try again.
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-primary/20 bg-primary-soft/45 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              No approved notes available yet
            </p>
            <p className="mt-2 text-sm text-muted">
              Once notes are approved, they&apos;ll appear here automatically.
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

                <h4 className="mt-4 text-xl font-semibold text-foreground">
                  {note.title}
                </h4>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
                  {note.semester ? (
                    <span className="rounded-full border border-primary/10 px-3 py-1">
                      Semester {note.semester}
                    </span>
                  ) : null}
                  {note.year ? (
                    <span className="rounded-full border border-primary/10 px-3 py-1">
                      {note.year}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-muted">{formatDate(note.uploaded_at)}</span>
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

