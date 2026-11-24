import { useEffect } from "react";
import { Trash2, X } from "lucide-react";
import { ProductArt } from "./Art";
import { Cat, SleepingCat } from "./Cat";
import { Squiggle } from "./Decor";
import { NAV_LINKS } from "./Header";
import { QtyStepper } from "./QtyStepper";
import { formatPrice } from "../lib/format";
import { useStore } from "../lib/store";

function useDrawer(c, r) {
  const { returnFocus: o } = useStore();
  useEffect(() => {
    if (!r) {
      return;
    }
    const f = (g) => g.key === "Escape" && c();
    document.addEventListener("keydown", f);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", f);
      document.body.style.overflow = "";
      o();
    };
  }, [r, c, o]);
}

export function MenuDrawer({ route: c }) {
  const { panel: r, setPanel: o } = useStore();
  const f = () => o(null);
  useDrawer(f, r === "menu");
  if (r !== "menu") {
    return null;
  } else {
    return (
      <>
        <div className="drawer-backdrop" onClick={f} />
        <div
          className="drawer drawer-right"
          role="dialog"
          aria-modal="true"
          aria-label="القائمة"
        >
          <div className="flex items-center justify-between px-5 h-[68px] border-b-2 border-ink">
            <span className="text-[22px] font-extrabold">القائمة</span>
            <button
              className="icon-btn !bg-pink"
              aria-label="إغلاق القائمة"
              onClick={f}
              autoFocus
            >
              <X size={22} strokeWidth={2.4} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-5">
            {NAV_LINKS.map((g) => {
              const m = g.href === `#${c}`;
              return (
                <a
                  key={g.href}
                  href={g.href}
                  onClick={f}
                  aria-current={m ? "page" : undefined}
                  className="flex items-center justify-between min-h-12 text-[18px] font-bold text-ink no-underline"
                >
                  {g.label}
                  {m && (
                    <Squiggle
                      className="w-16 h-3"
                      color="var(--color-pink-deep)"
                    />
                  )}
                </a>
              );
            })}
          </nav>
          <Cat awake className="w-24 mx-auto mt-auto mb-10" />
        </div>
      </>
    );
  }
}

export function CartDrawer() {
  const {
    panel: c,
    setPanel: r,
    lines: o,
    subtotal: f,
    setQty: g,
    remove: m,
    shipping: { freeMin: FREE_SHIPPING_MIN },
  } = useStore();
  const b = () => r(null);
  useDrawer(b, c === "cart");
  if (c !== "cart") {
    return null;
  }
  const S = Math.max(0, FREE_SHIPPING_MIN - f);
  return (
    <>
      <div className="drawer-backdrop" onClick={b} />
      <div
        className="drawer drawer-left"
        role="dialog"
        aria-modal="true"
        aria-label="السلة"
      >
        <div className="flex items-center justify-between px-5 h-[68px] border-b-2 border-ink">
          <span className="text-[22px] font-extrabold">سلتك</span>
          <button
            className="icon-btn !bg-pink"
            aria-label="إغلاق السلة"
            onClick={b}
            autoFocus
          >
            <X size={22} strokeWidth={2.4} />
          </button>
        </div>
        {o.length === 0 ? (
          <div className="flex-1 grid place-content-center text-center gap-3 p-6">
            <SleepingCat className="w-28 mx-auto" />
            <p className="text-[20px] font-bold m-0">السلة فاضية</p>
            <p className="lead m-0">ابدأ من المتجر وضيف اللي تحتاجه للدراسة.</p>
            <a href="#/shop" className="btn mx-auto mt-2" onClick={b}>
              تسوّق الآن
            </a>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b-2 border-dashed border-ink/20 text-[15px]">
              {S > 0 ? (
                <>
                  {"باقي "}
                  <b>{formatPrice(S)}</b>
                  {" وتوصلك الطلبية مجانًا"}
                </>
              ) : (
                <b>التوصيل مجاني لطلبك 🎉</b>
              )}
              <div className="mt-2 h-3 rounded-full border-2 border-ink bg-card overflow-hidden">
                <div
                  className="h-full bg-mint border-l-2 border-ink"
                  style={{
                    width: `${Math.min(100, (f / FREE_SHIPPING_MIN) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto list-none m-0 p-5 flex flex-col gap-4">
              {o.map((y) => (
                <li
                  key={`${y.id}-${y.color ?? ""}`}
                  className="flex gap-3 items-center"
                >
                  <div
                    className="w-[72px] h-[72px] shrink-0 rounded-2xl border-2 border-ink grid place-items-center"
                    style={{
                      background: y.product.tint,
                    }}
                  >
                    <ProductArt product={y.product} className="w-14 h-14" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 font-bold leading-snug">
                      {y.product.name}
                    </p>
                    {y.color && (
                      <p className="m-0 text-[14px] text-ink-soft">
                        {"اللون: "}
                        {y.color}
                      </p>
                    )}
                    <p className="m-0 text-ink-soft text-[15px]">
                      {formatPrice(y.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <QtyStepper
                        value={y.qty}
                        onChange={(h) => g(y.id, h, y.color)}
                        label={y.product.name}
                        small
                      />
                      <button
                        className="grid place-items-center w-11 h-11 rounded-xl bg-transparent border-0 text-ink-soft"
                        aria-label={`حذف ${y.product.name}`}
                        onClick={() => m(y.id, y.color)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-5 border-t-2 border-ink bg-card">
              <div className="flex justify-between text-[18px] font-bold mb-3">
                <span>المجموع</span>
                <span>{formatPrice(f)}</span>
              </div>
              <a href="#/checkout" className="btn btn-pink w-full" onClick={b}>
                كمّل الطلب
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
