"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

function sanitizeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

const inputClass =
  "w-full rounded-[3px] border border-line bg-card px-3 py-2.5 text-sm text-ink placeholder:text-soft/70 focus:border-ink focus:outline-none";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const params = useSearchParams();
  const next = sanitizeNext(params.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setLoading(false);
        return;
      }
      // Full navigation so server components pick up the new session cookie.
      window.location.href = next;
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {mode === "signup" && (
        <>
          <div>
            <label htmlFor="name" className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-soft">
              Name
            </label>
            <input id="name" name="name" required autoComplete="name" className={inputClass} placeholder="Chris Tan" />
          </div>
          <div>
            <label htmlFor="company" className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-soft">
              Company (optional)
            </label>
            <input id="company" name="company" autoComplete="organization" className={inputClass} placeholder="Acme Pte Ltd" />
          </div>
        </>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-soft">
          Work email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@company.com" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-soft">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </div>

      {error && (
        <p className="rounded-[3px] border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent-deep">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading
          ? "One moment…"
          : mode === "signup"
            ? "Create account"
            : "Log in"}
      </button>
    </form>
  );
}
