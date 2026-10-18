const API = "https://api.moyasar.com/v1";

// Moyasar's API authenticates with the secret key as the Basic-auth user and an empty password.
const authorization = (secretKey: string) => `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

export type MoyasarInvoice = { id: string; url: string; status: string; amount: number };

export async function createInvoice(secretKey: string, input: { amount: number; description: string; callbackUrl: string; backUrl: string; metadata: Record<string, string> }) {
  const response = await fetch(`${API}/invoices`, {
    signal: AbortSignal.timeout(20_000),
    method: "POST",
    headers: { Authorization: authorization(secretKey), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: input.amount, currency: "SAR", description: input.description, callback_url: input.callbackUrl, back_url: input.backUrl, metadata: input.metadata }),
  });
  if (!response.ok) throw new Error(`Moyasar ${response.status}: ${await response.text().catch(() => "")}`);
  return (await response.json()) as MoyasarInvoice;
}

export async function getInvoice(secretKey: string, invoiceId: string) {
  const response = await fetch(`${API}/invoices/${encodeURIComponent(invoiceId)}`, { signal: AbortSignal.timeout(20_000), headers: { Authorization: authorization(secretKey) } });
  if (!response.ok) throw new Error(`Moyasar ${response.status}`);
  return (await response.json()) as MoyasarInvoice;
}
