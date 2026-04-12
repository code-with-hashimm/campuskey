"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type StudentShellProps = {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
};

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/ask-ai", label: "Ask AI" },
  { href: "/events", label: "Events" },
  { href: "/notes", label: "PYQ" },
];

const comingSoonItems = ["Certificates", "Quizzes", "Feedback"];

export function StudentShell({
  children,
  userName,
  userEmail,
}: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const logout = async () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="campus-shell min-h-screen">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#130a27]/45 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-white/95 px-5 py-6 shadow-xl shadow-primary/10 backdrop-blur transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="mt-2 text-4xl font-semibold text-foreground font-[family-name:var(--font-surgena)]">
            CampusKey
          </h2>
          {/* Mobile Close Button - repositioned for centering context */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute right-4 top-6 rounded-full border border-primary/10 px-3 py-1 text-sm text-muted lg:hidden"
          >
            Close
          </button>
        </div>

        <nav className="mt-16 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-foreground hover:bg-primary-soft hover:text-primary"
                  }`}
              >
                <span>{item.label}</span>
                {item.label === "Events" ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                ) : isActive ? (
                  <span className="text-xs uppercase">Live</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-[24px] border border-dashed border-primary/20 bg-primary-soft/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
            Coming Soon
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {comingSoonItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary/10 bg-white px-3 py-1 text-xs font-medium text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <p className="px-4 text-xs font-medium text-slate-400 truncate mb-4" title={userEmail}>
            {userEmail}
          </p>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-2xl border border-primary/15 bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm lg:hidden"
              >
                Menu
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  Welcome back
                </p>
                <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                  {userName}
                </h1>
              </div>
            </div>


          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

