// Supabase Edge Function: send-reminders
// Deploy with: supabase functions deploy send-reminders
// Schedule with pg_cron (see comment at bottom) to run once daily.
//
// For each active subscription whose next_payment_date is within its
// reminder_days window, this creates a notification row and — if
// RESEND_API_KEY is set — emails the user.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, name, price, currency, next_payment_date, reminder_days")
    .eq("status", "active");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let created = 0;

  for (const sub of subs ?? []) {
    const dueDate = new Date(sub.next_payment_date);
    const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);

    if (daysUntilDue === sub.reminder_days || daysUntilDue === 0) {
      const message =
        daysUntilDue === 0
          ? `${sub.name} renews today (${sub.currency} ${sub.price}).`
          : `${sub.name} renews in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} (${sub.currency} ${sub.price}).`;

      const { error: insertError } = await supabase.from("notifications").insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        type: daysUntilDue === 0 ? "payment_due" : "renewal_reminder",
        message,
        scheduled_for: new Date().toISOString(),
      });

      if (!insertError) created += 1;

      if (RESEND_API_KEY) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", sub.user_id)
          .single();

        if (profile?.email) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Subscription Tracker <notifications@yourdomain.com>",
              to: profile.email,
              subject: `Upcoming charge: ${sub.name}`,
              text: message,
            }),
          });
        }
      }
    }
  }

  return new Response(JSON.stringify({ notifications_created: created }), {
    headers: { "Content-Type": "application/json" },
  });
});

// --- Scheduling (run once in the SQL editor, after deploying the function) ---
// select cron.schedule(
//   'send-subscription-reminders-daily',
//   '0 9 * * *', -- every day at 09:00 UTC
//   $$
//   select net.http_post(
//     url := 'https://<project-ref>.functions.supabase.co/send-reminders',
//     headers := jsonb_build_object('Authorization', 'Bearer <service-role-key>')
//   );
//   $$
// );
