// Minimal Resend client over the REST API (no SDK dependency).

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Hifocus <onboarding@resend.dev>";
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set; skipping send.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] Resend send failed (${res.status}): ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Resend send error", err);
    return false;
  }
}

/** Renewal reminder email HTML. */
export function billingReminderEmail(opts: {
  planLabel: string;
  amount: string;
  renewalDate: string;
  manageUrl: string;
}): { subject: string; html: string } {
  const { planLabel, amount, renewalDate, manageUrl } = opts;
  return {
    subject: `Your Hifocus ${planLabel} plan renews on ${renewalDate}`,
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
        <h1 style="font-size:20px;margin:0 0 12px">Upcoming renewal</h1>
        <p style="font-size:14px;line-height:1.6;color:#444">
          Heads up — your <strong>Hifocus ${planLabel}</strong> subscription
          (${amount}) renews on <strong>${renewalDate}</strong>.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#444">
          No action is needed to continue. To update your plan, payment method,
          or cancel, manage your subscription below.
        </p>
        <p style="margin:24px 0">
          <a href="${manageUrl}" style="background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;display:inline-block">
            Manage subscription
          </a>
        </p>
        <p style="font-size:12px;color:#999">Hifocus — focus, tracked.</p>
      </div>
    `,
  };
}
