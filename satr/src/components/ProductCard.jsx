import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { ProductArt } from "./Art";
import { KnitFrame } from "./KnitFrame";
import { formatPrice } from "../lib/format";
import { useStore } from "../lib/store";

const BADGE_COLORS = {
  جديد: "var(--color-butter)",
  خصم: "var(--color-pink)",
  "الأكثر طلبًا": "var(--color-mint)",
};

export function ProductCard({ product: c }) {
  const { add: r } = useStore();
  const [o, f] = useState(false);
  const g = c.stock <= 0;
  const m = () => {
    if (!g) {
      if (c.colors?.length) {
        window.location.hash = `#/product/${c.id}`;
        return;
      }
      r(c.id);
      f(true);
      window.setTimeout(() => f(false), 1400);
    }
  };
  return (
    <KnitFrame className="flex-1">
      <article className="!border-0 !shadow-none !bg-card !rounded-[13px] flex flex-col flex-1 min-h-0 overflow-hidden">
        <a
          href={`#/product/${c.id}`}
          className="relative block aspect-square"
          style={{
            background: c.tint,
          }}
          aria-label={c.name}
        >
          <ProductArt product={c} />
          {c.badge && (
            <span
              className="tag absolute top-3 right-3 max-w-[60%] !text-[13px] !whitespace-normal leading-snug text-center -rotate-3"
              style={{
                background: BADGE_COLORS[c.badge],
              }}
            >
              {c.badge}
            </span>
          )}
        </a>
        <div className="flex flex-col gap-1 p-3 pt-2.5 flex-1 min-w-0">
          <h2 className="m-0 text-[16px] font-bold leading-snug break-words">
            <a href={`#/product/${c.id}`} className="text-ink no-underline">
              {c.name}
            </a>
          </h2>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-1">
            <p className="m-0 leading-tight">
              <span className="font-extrabold text-[17px] whitespace-nowrap">
                {formatPrice(c.price)}
              </span>
              {c.oldPrice && (
                <s className="block text-[13px] text-ink-soft">
                  {formatPrice(c.oldPrice)}
                </s>
              )}
            </p>
            <button
              className={`icon-btn shrink-0 ${o ? "!bg-mint" : g ? "!bg-card opacity-60" : "!bg-butter"}`}
              aria-label={
                g
                  ? `${c.name} خلص`
                  : o
                    ? `أُضيف ${c.name} للسلة`
                    : `أضف ${c.name} للسلة`
              }
              disabled={g}
              onClick={m}
            >
              {o ? (
                <Check size={20} strokeWidth={2.8} />
              ) : (
                <Plus size={20} strokeWidth={2.8} />
              )}
            </button>
          </div>
        </div>
      </article>
    </KnitFrame>
  );
}
