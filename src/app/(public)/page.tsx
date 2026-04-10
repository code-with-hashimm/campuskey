import { AuthOverlay } from "@/components/auth-overlay";

const highlights = [
  "Access approved PYQs and study materials instantly",
  "Track webinars, events, and upcoming academic sessions",
  "Move between student tools in one focused workspace",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f2ff] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(107,70,193,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.14),_transparent_34%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/75">
              CampusKey
            </p>
            <h1 className="mt-2 text-lg font-semibold text-foreground">
              Learn faster. Stay aligned.
            </h1>
          </div>
          <AuthOverlay />
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-sm">
              Student dashboard, events, notes, and AI shell in one place
            </div>

            <h2 className="mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Your campus workflow, rebuilt for a cleaner Next.js experience.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              CampusKey brings together note discovery, event updates, and your
              day-to-day student tools behind one focused dashboard with
              role-aware access.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[28px] border border-primary/10 bg-white/90 p-5 shadow-lg shadow-primary/8"
                >
                  <div className="mb-4 h-10 w-10 rounded-2xl bg-primary-soft" />
                  <p className="text-sm leading-6 text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-primary/12 bg-white/92 p-6 shadow-2xl shadow-primary/12">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-primary p-5 text-white">
                <p className="text-sm font-medium text-white/80">Recent Notes</p>
                <h3 className="mt-3 text-2xl font-semibold">6 curated items</h3>
                <p className="mt-4 text-sm leading-6 text-white/80">
                  Surface the latest approved academic material from a single
                  dashboard.
                </p>
              </div>

              <div className="rounded-[28px] border border-primary/10 bg-primary-soft/70 p-5">
                <p className="text-sm font-medium text-primary">Events Feed</p>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">
                  Active webinars
                </h3>
                <p className="mt-4 text-sm leading-6 text-muted">
                  Stay aware of academic events and session links without digging
                  through separate pages.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-primary/10 bg-[#faf8ff] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Student shell</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">
                    Mobile-friendly navigation
                  </h3>
                </div>
                <div className="rounded-full border border-primary/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">
                  App Router
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {["Home", "Ask AI", "Events", "PYQ"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-primary/10 bg-white px-4 py-3"
                  >
                    <span className="font-medium text-foreground">{item}</span>
                    <span className="text-xs uppercase tracking-[0.22em] text-muted">
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

