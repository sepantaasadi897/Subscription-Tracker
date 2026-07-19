"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Receipt, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-card">
          <CheckCircle2 className="mx-auto mb-3 text-mint" size={32} />
          <h1 className="font-display text-xl font-semibold text-ink">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted">
            We sent a confirmation link to <span className="text-ink">{email}</span>. Click it to
            activate your account.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Receipt size={16} />
          </div>
          <span className="font-display text-lg font-semibold text-ink">Ledger</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h1 className="font-display text-xl font-semibold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Takes less than a minute.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              id="fullName"
              label="Full name"
              placeholder="Jordan Rivera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-coral">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
