import { AuthOverlay } from "@/components/auth-overlay";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
// Import the files we just created! Ensure the paths match your project structure.
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { FeaturesGrid, VideoTestimonials, CTABanner, Footer } from "@/components/ui/landing-sections";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-slate-50 text-foreground">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-30" />

      {/* ── HEADER ── */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 w-full">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tighter text-slate-900 font-[family-name:var(--font-surgena)] select-none">
          CampusKey
        </h1>
        <AuthOverlay />
      </header>

      {/* ── HERO SECTION ── */}
      {/* ── HERO SECTION ── */}
      <section className="relative w-full px-6 md:px-12 py-16 md:py-24 overflow-hidden">

        {/* Subtle background orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[30%] w-[220px] h-[220px] rounded-full bg-slate-900/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="flex flex-col gap-6">

            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Built by students, for students
            </div>

            {/* Headline */}
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-slate-900 leading-[1.05] font-[family-name:var(--font-surgena)]">
              Study smarter.<br />
              <em className="not-italic text-indigo-600">Not harder.</em>
            </h2>

            {/* Subtext */}
            <p className="text-slate-500 text-lg leading-relaxed max-w-md font-normal">
              PYQs, notes, and an AI study assistant — all in one place. Stop hunting across 10 tabs and just focus.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap">
              <AuthOverlay />
              <button className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-800 transition-colors">
                See how it works
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 pt-6 mt-2 border-t border-slate-200">
              {[
                { num: "2,400+", label: "PYQs indexed" },
                { num: "12", label: "Subjects" },
                { num: "Free", label: "Always" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-slate-900 tracking-tight font-[family-name:var(--font-surgena)]">{num}</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Floating cards ── */}
          <div className="relative h-[380px] hidden md:block">

            {/* Main dashboard card */}
            <div className="absolute top-4 right-0 w-[260px] bg-white rounded-2xl border border-slate-100 shadow-xl p-5 animate-[floatA_4s_ease-in-out_infinite]">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Your dashboard</p>
              <p className="text-sm font-bold text-slate-800 mb-4">BCA — Semester 4</p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: "📄", label: "Notes", badge: "48 files", bg: "bg-indigo-50", text: "text-indigo-600" },
                  { icon: "📝", label: "PYQs", badge: "6 years", bg: "bg-green-50", text: "text-green-700" },
                  { icon: "🤖", label: "AI Assistant", badge: "Active", bg: "bg-orange-50", text: "text-orange-600" },
                ].map(({ icon, label, badge, bg, text }) => (
                  <div key={label} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-sm`}>{icon}</div>
                    <span className="text-sm text-slate-700 flex-1">{label}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PYQ chip card */}
            <div className="absolute top-[90px] left-2 w-[148px] bg-indigo-50 rounded-2xl border border-indigo-100 p-4 animate-[floatB_5s_ease-in-out_infinite_0.5s]">
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">PYQs</p>
              <p className="text-sm font-bold text-indigo-900 mb-3">Data Structures</p>
              <div className="flex flex-wrap gap-1">
                {["2024", "2023", "2022", "2021"].map(y => (
                  <span key={y} className="text-[10px] bg-indigo-200/60 text-indigo-700 px-1.5 py-0.5 rounded font-medium">{y}</span>
                ))}
              </div>
            </div>

            {/* AI assistant card */}
            <div className="absolute bottom-8 left-0 w-[210px] bg-slate-900 rounded-2xl p-4 animate-[floatC_4s_ease-in-out_infinite_1s]">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2">AI Assistant</p>
              <p className="text-sm italic text-slate-300 mb-2 leading-snug">"Explain deadlock in OS simply"</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deadlock is when two processes wait for each other forever
                <span className="inline-block w-0.5 h-3 bg-indigo-400 ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── BELOW HERO CONTENT (Wrapped in the Animated Line) ── */}
      <AnimatedBackground>
        <div className="flex flex-col relative z-20 pb-8 min-h-full">
          {/* Top Content Box - spaced evenly */}
          <div className="flex flex-col justify-evenly flex-1">
            <FeaturesGrid />

            <section className="py-16 md:py-24 rounded-[40px] my-12 border border-white/20 shadow-xl shadow-indigo-500/5">
              <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left: Illustration */}
                <div className="flex justify-center md:justify-start">
                  <div className="w-full max-w-[280px] lg:max-w-md">
                    <HeroIllustration className="w-full h-auto text-slate-800 drop-shadow-2xl animate-float" />
                  </div>
                </div>

                {/* Right: Content */}
                <div className="space-y-6 text-center md:text-left">
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                    Academic focus,<br />
                    <span className="text-indigo-600">reimagined.</span>
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                    CampusKey brings all your essential study materials, event schedules, and focus tools into a single, cohesive experience. Stop juggling tabs and start moving faster.
                  </p>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      Trusted by 2,000+ Students
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <VideoTestimonials />
          </div>

          {/* Glued exactly to bottom to touch Footer smoothly */}
          <div className="mt-auto">
            <CTABanner />
          </div>
        </div>
      </AnimatedBackground>
      <Footer />
    </main>
  );
}