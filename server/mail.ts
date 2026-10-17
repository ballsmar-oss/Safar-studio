import { getSettings } from "./db";
import { decryptSecret } from "./secrets";

type Mail = { to: string; subject: string; text: string };

// Sends through Resend once its key and the business email are saved in the dashboard.
// Returns false (and logs) when email isn't set up yet, so callers never fail on it.
export async function sendEmail(mail: Mail) {
  const settings = getSettings();
  const apiKey = decryptSecret(settings?.resendApiKey);
  const from = settings?.businessEmail;
  if (!apiKey || !from) {
    console.info(`[mail] not configured, skipped: ${mail.subject} → ${mail.to}`);
    return false;
  }
  const sender = settings?.senderName ? `${settings.senderName} <${from}>` : from;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: sender, to: [mail.to], subject: mail.subject, text: mail.text }),
  });
  if (!response.ok) {
    console.error(`[mail] Resend ${response.status}: ${await response.text().catch(() => "")}`);
    return false;
  }
  return true;
}

export async function notifyOwner(subject: string, text: string) {
  const to = getSettings()?.businessEmail;
  if (!to) {
    console.info(`[mail] no business email set, skipped: ${subject}`);
    return false;
  }
  return sendEmail({ to, subject, text });
}
