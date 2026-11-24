import { Menu, ShoppingBasket } from "lucide-react";
import { useStore } from "../lib/store";

export const NAV_LINKS = [
  {
    href: "#/",
    label: "الرئيسية",
  },
  {
    href: "#/shop",
    label: "المتجر",
  },
  {
    href: "#/school-list",
    label: "قائمة المدرسة",
  },
  {
    href: "#/track",
    label: "تتبع طلبك",
  },
  {
    href: "#/admin",
    label: "لوحة التحكم",
  },
];

function Logo() {
  return (
    <a
      href="#/"
      className="flex items-center gap-2 no-underline text-ink"
      aria-label="سطر — الرئيسية"
    >
      <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
        <rect
          x="4"
          y="5"
          width="32"
          height="30"
          rx="8"
          fill="#f7c6cf"
          stroke="#3b3242"
          strokeWidth="2.5"
        />
        <path
          d="M11 15h18M11 21h18M11 27h11"
          stroke="#3b3242"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M30 5v30" stroke="#f198aa" strokeWidth="2" />
      </svg>
      <span className="text-[28px] font-extrabold leading-none tracking-tight">
        سطر
      </span>
    </a>
  );
}

export function Header({ route: c }) {
  const { count: r, setPanel: o } = useStore();
  return (
    <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
      <div className="wrap flex items-center justify-between h-[66px] gap-3">
        <div className="flex items-center gap-3">
          <button
            className="icon-btn lg:hidden"
            aria-label="فتح القائمة"
            onClick={() => o("menu")}
          >
            <Menu size={22} strokeWidth={2.4} />
          </button>
          <Logo />
        </div>
        <nav className="hidden lg:flex items-center gap-1" aria-label="الأقسام">
          {NAV_LINKS.map((f) => {
            const g = f.href === `#${c}` || (f.href === "#/" && c === "/");
            return (
              <a
                key={f.href}
                href={f.href}
                aria-current={g ? "page" : undefined}
                className={`px-4 py-1.5 rounded-full font-bold text-[17px] no-underline text-ink border-2 ${g ? "bg-mint border-ink" : "border-transparent hover:bg-mint-soft"}`}
              >
                {f.label}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <button
            className="btn btn-butter btn-sm !min-h-[44px] !px-4 !text-[16px]"
            lang="en"
          >
            English
          </button>
          <button
            className="icon-btn !bg-mint"
            aria-label={`السلة، ${r} منتجات`}
            onClick={() => o("cart")}
          >
            <ShoppingBasket size={22} strokeWidth={2.4} />
            {r > 0 && (
              <span className="absolute -top-2 -left-2 min-w-6 h-6 px-1 grid place-items-center rounded-full bg-pink-deep border-2 border-ink text-[13px] font-bold leading-none">
                {r.toLocaleString("ar-SA")}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
