import nodemailer from "nodemailer";
import { getSettings } from "./db";
import { decryptSecret } from "./secrets";

type Mail = { to: string; subject: string; text: string };

// Sends through your own SMTP account once its host, user and password are saved in the dashboard.
// Resend is used only when SMTP is not set. Returns false (and logs) when neither is set up.
export async function sendEmail(mail: Mail) {
  const settings = getSettings();
  const from = settings?.businessEmail;
  if (!from) {
    console.info(`[mail] no business email, skipped: ${mail.subject} → ${mail.to}`);
    return false;
  }
  const sender = settings?.senderName ? `${settings.senderName} <${from}>` : from;
  const smtpPassword = decryptSecret(settings?.smtpPassword);
  if (settings?.smtpHost && settings.smtpUser && smtpPassword) {
    try {
      const transport = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort ?? 465,
        secure: (settings.smtpPort ?? 465) === 465,
        auth: { user: settings.smtpUser, pass: smtpPassword },
      });
      await transport.sendMail({ from: sender, to: mail.to, subject: mail.subject, text: mail.text });
      return true;
    } catch (error) {
      console.error(`[mail] SMTP failed: ${error instanceof Error ? error.message : error}`);
      return false;
    }
  }
  const apiKey = decryptSecret(settings?.resendApiKey);
  if (!apiKey) {
    console.info(`[mail] not configured, skipped: ${mail.subject} → ${mail.to}`);
    return false;
  }
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
