import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";

const previewRows = [
  { name: "Netflix", cat: "Entertainment", due: "in 3 days", amount: "$15.49" },
  { name: "Fibre 500", cat: "Internet", due: "in 6 days", amount: "$54.00" },
  { name: "Health Cover", cat: "Insurance", due: "in 11 days", amount: "$128.00" },
  { name: "Figma", cat: "Software", due: "in 18 days", amount: "$15.00" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Receipt size={16} />
          </div>
          <span className="font-display text-lg font-semibold text-ink">Ledger</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center gap-6">
          <span className="w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            Every recurring charge, one statement
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Know what&apos;s about to hit your card{" "}
            <span className="text-primary">before it does.</span>
          </h1>
          <p className="max-w-md text-base text-muted">
            Ledger tracks every subscription — streaming, software, insurance,
            the gym you keep meaning to cancel — and tells you exactly what
            renews, when, and what it&apos;s costing you over the year.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                Start tracking free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">I already have an account</Button>
            </Link>
          </div>
        </div>

        {/* Signature element: a ledger/receipt-style upcoming charges rail */}
        <div className="flex items-center">
          <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="mb-5 flex items-baseline justify-between">
              <p className="font-display text-sm font-semibold text-ink">Upcoming charges</p>
              <p className="font-mono text-xs text-muted">4 due this month</p>
            </div>
            <ul className="ledger-rail space-y-5 pl-5">
              {previewRows.map((row) => (
                <li key={row.name} className="relative flex items-center justify-between">
                  <span className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-bg" />
                  <div>
                    <p className="text-sm font-medium text-ink">{row.name}</p>
                    <p className="text-xs text-muted">{row.cat} · {row.due}</p>
                  </div>
                  <span className="tabular font-mono text-sm text-ink">{row.amount}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted">Est. monthly total</span>
              <span className="tabular font-mono text-base font-semibold text-ink">$212.49</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {[
            {
              title: "Renewal reminders",
              body: "Set a reminder window per subscription and get a nudge before you're charged.",
            },
            {
              title: "Spend by category",
              body: "See where money actually goes: entertainment, software, insurance, and more.",
            },
            {
              title: "One true total",
              body: "Weekly, monthly, and yearly plans normalized into a single monthly and yearly figure.",
            },
          ].map((f) => (
            <div key={f.title} className="space-y-2">
              <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
              <p className="text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted">
        © {new Date().getFullYear()} Ledger. Built with Next.js and Supabase.
      </footer>
    </main>
  );
}
