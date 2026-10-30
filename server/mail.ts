import fs from "node:fs";
import nodemailer from "nodemailer";
import { getSettings } from "./db";
import { decryptSecret } from "./secrets";

type Attachment = { filename: string; path: string };
type Mail = { to: string; subject: string; text: string; attachments?: Attachment[] };

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
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 20_000,
      });
      await transport.sendMail({ from: sender, to: mail.to, subject: mail.subject, text: mail.text, attachments: mail.attachments });
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
    signal: AbortSignal.timeout(20_000),
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      attachments: mail.attachments?.map((file) => ({ filename: file.filename, content: fs.readFileSync(file.path).toString("base64") })),
    }),
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

// Checks the Resend key: the domains list only answers for a valid key.
// A "sending access" key is allowed to send but not to list domains, so Resend answers "restricted". That still means the key is valid.
export async function checkResendKey(apiKey: string) {
  const response = await fetch("https://api.resend.com/domains", {
    signal: AbortSignal.timeout(15_000),
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (response.ok) return true;
  const body = await response.text().catch(() => "");
  return /restricted/i.test(body);
}
