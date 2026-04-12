import { Play } from "lucide-react";

export const FeaturesGrid = () => {
    const features = [
        { title: "PYQs", desc: "Previous year questions organized by year and subject.", icon: "📄" },
        { title: "Notes", desc: "Handwritten and digital notes from top-performing students.", icon: "✍️" },
        { title: "AI Chatbot", desc: "Instantly solve doubts and summarize long lecture notes.", icon: "🤖" },
        { title: "Branch Filters", desc: "Tailored content for CSE, ME, ECE, and more.", icon: "📂" },
    ];

    return (
        <section className="py-24 max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-20 tracking-tight">
                Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((f, i) => (
                    <div
                        key={i}
                        className={`bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 
              ${i % 2 === 0 ? "lg:-translate-y-8" : "lg:translate-y-8"}`}
                    >
                        <span className="text-4xl">{f.icon}</span>
                        <h3 className="text-xl font-bold">{f.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const VideoTestimonials = () => {
    const testimonials = [
        { name: "Arjun Mehta", branch: "CSE '25" },
        { name: "Sneha Kapoor", branch: "ECE '24" },
        { name: "Rahul Singh", branch: "ME '26" },
    ];

    return (
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight">
                    What Students Say
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {testimonials.map((t, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="relative aspect-[3/4] w-full bg-slate-200 rounded-2xl overflow-hidden shadow-md transition-transform group-hover:scale-[1.02]">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        <Play className="fill-indigo-600 text-indigo-600 ml-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-lg">{t.name}</p>
                                <p className="text-sm text-slate-500 uppercase tracking-widest">{t.branch}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const CTABanner = () => {
    return (
        <section className="py-32 px-6">
            <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[100px]" />
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">
                    Start Studying Smarter
                </h2>
                <button className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-full text-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                    Join CampusKey Free
                </button>
            </div>
        </section>
    );
};