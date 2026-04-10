"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Mode = "login" | "register";

type FormState = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const initialState: FormState = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export function AuthOverlay() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const open = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setNotice(null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setError(null);
    setNotice(null);
  };

  const handleLogin = async () => {
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      throw signInError;
    }

    const userId = data.user?.id;

    if (!userId) {
      throw new Error("Unable to load your account.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    router.push(profile?.role === "admin" ? "/admin/dashboard" : "/dashboard");
    router.refresh();
  };

  const handleRegister = async () => {
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          role: "student",
        },
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        role: "student",
      });

      if (profileError) {
        throw profileError;
      }
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setNotice("Account created. Check your email to confirm your registration.");
    setMode("login");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsPending(true);

    try {
      if (mode === "login") {
        await handleLogin();
      } else {
        await handleRegister();
      }

      setForm(initialState);
      if (mode === "login") {
        close();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => open("login")}
          className="rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => open("register")}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:bg-primary-strong"
        >
          Create account
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#130a27]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/45 bg-white shadow-2xl shadow-primary/20">
            <div className="border-b border-primary/10 bg-primary-soft/70 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    CampusKey Access
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    {mode === "login" ? "Welcome back" : "Join CampusKey"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border border-primary/10 px-3 py-1.5 text-sm text-muted hover:border-primary/25 hover:text-primary"
                >
                  Close
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
              {mode === "register" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">First name</span>
                    <input
                      required
                      value={form.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                      className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">Last name</span>
                    <input
                      required
                      value={form.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                      className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>
                </div>
              ) : null}

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-foreground">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-foreground">Password</span>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>

              {error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3 text-sm text-primary-strong">
                  {notice}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending
                  ? "Please wait..."
                  : mode === "login"
                    ? "Log in to dashboard"
                    : "Create student account"}
              </button>

              <p className="text-center text-sm text-muted">
                {mode === "login"
                  ? "New here?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="font-semibold text-primary hover:text-primary-strong"
                >
                  {mode === "login" ? "Create an account" : "Log in"}
                </button>
              </p>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

