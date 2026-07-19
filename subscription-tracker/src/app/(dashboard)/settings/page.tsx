"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CURRENCIES, type Profile } from "@/lib/types";
import { exportSubscriptionsToCsv } from "@/lib/export";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { subscriptions } = useSubscriptions();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data as Profile);
        setFullName(data.full_name ?? "");
        setDefaultCurrency(data.default_currency ?? "USD");
      }
    })();
  }, [supabase]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, default_currency: defaultCurrency })
      .eq("id", profile.id);

    setSaving(false);
    if (!error) setSaved(true);
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "This will permanently delete your account and all subscription data. This cannot be undone. Continue?"
    );
    if (!confirmed) return;
    // Actual account deletion requires the service-role key and must run
    // server-side (e.g. a Route Handler calling supabase.auth.admin.deleteUser).
    // Wire that endpoint up, then call it here.
    alert("Connect this to a server route that calls supabase.auth.admin.deleteUser().");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 animate-fade-up">
      <Card className="p-6">
        <h2 className="font-display text-base font-semibold text-ink">Profile</h2>
        <p className="mt-1 text-sm text-muted">Update your name and default currency.</p>

        <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
          <Input
            id="fullName"
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input id="email" label="Email" value={profile?.email ?? ""} disabled />
          <Select
            id="currency"
            label="Default currency"
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {saved && <span className="text-sm text-mint">Saved</span>}
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-base font-semibold text-ink">Your data</h2>
        <p className="mt-1 text-sm text-muted">
          Export all {subscriptions.length} subscriptions as a CSV file.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => exportSubscriptionsToCsv(subscriptions)}
          disabled={subscriptions.length === 0}
        >
          <Download size={16} /> Export as CSV
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-base font-semibold text-ink">Account</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleLogout}>Log out</Button>
          <Button variant="danger" onClick={handleDeleteAccount}>Delete account</Button>
        </div>
      </Card>
    </div>
  );
}
