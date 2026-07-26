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

/** Renewal reminder email — table-based HTML for broad email-client support. */
export function billingReminderEmail(opts: {
  planLabel: string;
  amount: string;
  renewalDate: string;
  manageUrl: string;
}): { subject: string; html: string } {
  const { planLabel, amount, renewalDate, manageUrl } = opts;
  const font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0b0f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0f;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.4);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#18181b,#0b0b0f);padding:24px 28px;">
                <span style="font-family:${font};font-size:18px;font-weight:700;letter-spacing:1px;color:#fbbf24;">HIFOCUS</span>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px 28px 8px;">
                <p style="margin:0 0 6px;font-family:${font};font-size:13px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#a1a1aa;">Upcoming renewal</p>
                <h1 style="margin:0 0 16px;font-family:${font};font-size:22px;line-height:1.3;color:#18181b;">Your ${planLabel} plan renews soon</h1>
                <p style="margin:0 0 24px;font-family:${font};font-size:15px;line-height:1.6;color:#52525b;">
                  This is a friendly heads-up that your Hifocus subscription is about to renew. No action is needed to keep your focus streak going.
                </p>
              </td>
            </tr>
            <!-- Detail card -->
            <tr>
              <td style="padding:0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;font-family:${font};font-size:14px;color:#71717a;">Plan</td>
                    <td style="padding:16px 20px;font-family:${font};font-size:14px;font-weight:600;color:#18181b;text-align:right;">${planLabel}</td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid #e4e4e7;"></td></tr>
                  <tr>
                    <td style="padding:16px 20px;font-family:${font};font-size:14px;color:#71717a;">Amount</td>
                    <td style="padding:16px 20px;font-family:${font};font-size:14px;font-weight:600;color:#18181b;text-align:right;">${amount}</td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid #e4e4e7;"></td></tr>
                  <tr>
                    <td style="padding:16px 20px;font-family:${font};font-size:14px;color:#71717a;">Renews on</td>
                    <td style="padding:16px 20px;font-family:${font};font-size:14px;font-weight:700;color:#18181b;text-align:right;">${renewalDate}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- CTA -->
            <tr>
              <td style="padding:28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:10px;background:#18181b;">
                      <a href="${manageUrl}" style="display:inline-block;padding:12px 26px;font-family:${font};font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Manage subscription</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;font-family:${font};font-size:13px;line-height:1.6;color:#a1a1aa;">
                  Want to change or cancel your plan? You can do it any time from the button above.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 28px;background:#fafafa;border-top:1px solid #eee;">
                <p style="margin:0;font-family:${font};font-size:12px;color:#a1a1aa;">Hifocus — focus, tracked. You're receiving this because you have an active subscription.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject: `Your Hifocus ${planLabel} plan renews on ${renewalDate}`,
    html,
  };
}
