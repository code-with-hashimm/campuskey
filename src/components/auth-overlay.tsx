"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/auth";
import HCaptcha from "@hcaptcha/react-hcaptcha";

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
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsPending(true);

    if (!captchaToken) {
      setError("Please complete the captcha.");
      setIsPending(false);
      return;
    }

    try {
      if (mode === "login") {
        const session = await login(form.email, form.password, captchaToken);
        if ("error" in session) {
          setError(session.error as string);
          captchaRef.current?.resetCaptcha();
          setCaptchaToken("");
        } else {
          setForm(initialState);
          router.push(session.role === "admin" ? "/admin/dashboard" : "/dashboard");
          router.refresh();
        }
      } else {
        const session = await register(
          form.firstName,
          form.lastName,
          form.email,
          form.password,
          captchaToken
        );
        if ("error" in session) {
          setError(session.error as string);
          captchaRef.current?.resetCaptcha();
          setCaptchaToken("");
        } else {
          setForm(initialState);
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (submitError: any) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => open("login")}
          className="rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition-all"
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => open("register")}
          className="rounded-full bg-slate-950 px-6 py-2 text-sm font-semibold text-white shadow-xl hover:bg-slate-900 transition-all"
        >
          Create account
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl shadow-primary/20">
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
                  className="rounded-full border border-primary/20 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-primary/40 hover:text-primary hover:bg-primary-soft/50 transition-colors"
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
                      className="w-full rounded-2xl border border-primary/15 bg-slate-50/50 px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">Last name</span>
                    <input
                      required
                      value={form.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                      className="w-full rounded-2xl border border-primary/15 bg-slate-50/50 px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground"
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
                  className="w-full rounded-2xl border border-primary/15 bg-slate-50/50 px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground"
                />
              </label>
              <label className="block space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Password</span>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        router.push("/forgot-password");
                      }}
                      className="text-xs font-semibold text-primary hover:text-primary-strong"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className="w-full rounded-2xl border border-primary/15 bg-slate-50/50 px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground"
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

              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken("")}
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !captchaToken}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending
                  ? "Please wait..."
                  : mode === "login"
                    ? "Log in to dashboard"
                    : "Create student account"}
              </button>

              <p className="text-center text-sm text-slate-500 font-medium">
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

