import { useState } from "react";
import { getConsent, setConsent, type Consent } from "@/lib/consent";

// Asks once. Accepting loads the measurement tag; refusing loads nothing.
export function ConsentBanner() {
  const [choice, setChoice] = useState<Consent | null>(() => getConsent());
  if (choice !== null) return null;

  const pick = (value: Consent) => {
    setConsent(value);
    setChoice(value);
  };

  return (
    <div
      role="dialog"
      aria-label="الكوكيز"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-[#0d2b52]/15 bg-[#fff8e8] p-4 text-[#0d2b52] shadow-lg sm:flex-row sm:items-center"
    >
      <p className="flex-1 text-sm leading-7">
        نستخدم كوكيز للقياس وتحسين الإعلانات، ولا نفعّلها إلا بموافقتك.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => pick("denied")}
          className="rounded-full border border-[#0d2b52]/30 px-4 py-2 text-sm font-bold"
        >
          رفض
        </button>
        <button
          type="button"
          onClick={() => pick("granted")}
          className="rounded-full bg-[#0d2b52] px-4 py-2 text-sm font-bold text-[#fff5df]"
        >
          قبول
        </button>
      </div>
    </div>
  );
}
