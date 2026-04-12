"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/password";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setMessage(null);

    const res = await requestPasswordReset(email);
    
    if ("error" in res) {
      setError(res.error ?? "An unexpected error occurred.");
    } else {
      setMessage(res.message || "Request sent successfully.");
    }
    setIsPending(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-white/20 bg-white/40 backdrop-blur-xl shadow-2xl p-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot password?</h1>
          <p className="mt-2 text-slate-500">No worries, we&apos;ll send you reset instructions.</p>
        </div>

        {message ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">Check your email</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              {message}
            </p>
            <Link 
              href="/" 
              className="mt-6 block w-full py-3 bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-slate-950 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Wait, I remember it!{" "}
              <Link href="/" className="font-bold text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
