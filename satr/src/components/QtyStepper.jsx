import { Minus, Plus } from "lucide-react";

export function QtyStepper({
  value: c,
  onChange: r,
  label: o,
  small: f = false,
}) {
  const g = f ? "h-11" : "h-[54px]";
  return (
    <div
      className={`inline-flex items-center ${g} rounded-2xl border-2 border-ink bg-card overflow-hidden`}
    >
      <button
        className="w-11 h-full grid place-items-center bg-transparent border-0"
        aria-label={`زيادة كمية ${o}`}
        onClick={() => r(c + 1)}
      >
        <Plus size={18} strokeWidth={2.6} />
      </button>
      <span
        className="min-w-8 text-center font-bold text-[17px]"
        aria-live="polite"
      >
        {c.toLocaleString("ar-SA")}
      </span>
      <button
        className="w-11 h-full grid place-items-center bg-transparent border-0"
        aria-label={`تقليل كمية ${o}`}
        onClick={() => r(c - 1)}
      >
        <Minus size={18} strokeWidth={2.6} />
      </button>
    </div>
  );
}
