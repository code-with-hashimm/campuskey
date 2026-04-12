import { AuthOverlay } from "@/components/auth-overlay";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
// Import the files we just created! Ensure the paths match your project structure.
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { FeaturesGrid, VideoTestimonials, CTABanner } from "@/components/ui/landing-sections";

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
      <section
        className="relative w-full overflow-hidden"
        style={{
          height: "70vh",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)",
        }}
      >
        <img
          src="/college-bg.jpg"
          alt="Campus background"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover blur-[2px] opacity-70"
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-4 text-center">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] select-none">
              One space.<br />Infinite focus.
            </h2>
            <p className="mx-auto max-w-[560px] text-white/85 font-medium text-lg md:text-xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
              Your unified gateway for academic notes, events, and focus tools.
            </p>
          </div>
        </div>
      </section>

      {/* ── BELOW HERO CONTENT (Wrapped in the Animated Line) ── */}
      <AnimatedBackground>
        <div className="flex flex-col relative z-10 pb-20">
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
          <CTABanner />
        </div>
      </AnimatedBackground>
    </main>
  );
}