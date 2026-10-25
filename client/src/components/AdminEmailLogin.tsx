import { useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";

// Shown on a registered browser until the owner enters the code sent to their email.
export default function AdminEmailLogin() {
  const utils = trpc.useUtils();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(path: string, body?: object) {
    const res = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "حصل خطأ، حاول مرة ثانية.");
    return data;
  }

  async function sendCode() {
    setBusy(true);
    setMessage("");
    try {
      await post("/admin/login/send");
      setSent(true);
      setMessage("أرسلنا الرمز على الإيميل المسجّل.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await post("/admin/login/verify", { code });
      await utils.auth.me.invalidate();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#fff5df] p-6">
      <div className="w-full max-w-sm rounded-2xl border-2 border-[#14305a] bg-white p-6 shadow-[6px_6px_0_#14305a]">
        <h1 className="mb-2 text-2xl font-black text-[#14305a]">تأكيد الدخول</h1>
        <p className="mb-5 text-sm text-slate-600">
          لوحة التحكم تفتح بعد ما نتأكد إنك صاحب الإيميل. نرسل رمز من ٦ أرقام على إيميلك.
        </p>

        {!sent ? (
          <button type="button" onClick={sendCode} disabled={busy} className="w-full rounded-full bg-[#14305a] px-5 py-3 font-bold text-[#fdf5e4] disabled:opacity-60">
            {busy ? "جاري الإرسال..." : "أرسل الرمز"}
          </button>
        ) : (
          <form onSubmit={verify} className="space-y-3">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              dir="ltr"
              className="w-full rounded-xl border-2 border-[#14305a] px-4 py-3 text-center text-2xl tracking-[0.4em]"
            />
            <button type="submit" disabled={busy || code.length !== 6} className="w-full rounded-full bg-[#14305a] px-5 py-3 font-bold text-[#fdf5e4] disabled:opacity-60">
              {busy ? "جاري التحقق..." : "دخول"}
            </button>
            <button type="button" onClick={sendCode} disabled={busy} className="w-full text-sm font-bold text-[#e8836b] disabled:opacity-60">
              أرسل رمز جديد
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
      </div>
    </div>
  );
}
