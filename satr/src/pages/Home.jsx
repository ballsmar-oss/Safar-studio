import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Gift,
  PackageCheck,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { Art } from "../components/Art";
import { SleepyCatButton } from "../components/Cat";
import { CatalogState } from "../components/CatalogState";
import {
  Heart,
  Marquee,
  PaperClip,
  Squiggle,
  Star,
  WavyEdge,
} from "../components/Decor";
import { ProductCard } from "../components/ProductCard";
import { Puzzle } from "../components/Puzzle";
import { PAYMENT_METHODS } from "../lib/format";
import { useStore } from "../lib/store";

import mishmishVideo from "../assets/media/mishmish-polaroid.mp4";

export function HomePage() {
  const { catalog: c } = useStore();
  if (c.status !== "ready") {
    return <CatalogState catalog={c} />;
  } else {
    return (
      <>
        <Hero />
        <div className="my-10 lg:my-14">
          <Marquee
            words={[
              "دفاتر",
              "أقلام",
              "شنط مدرسية",
              "ألوان ورسم",
              "أدوات هندسية",
              "مقالم",
            ]}
          />
        </div>
        <Categories />
        <NewArrivals />
        <Steps />
        <SchoolListPromo />
        <About />
      </>
    );
  }
}

function Hero() {
  const [c, r] = useState(false);
  return (
    <section className="wrap relative pt-8 lg:pt-16 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <span
        className="pointer-events-none absolute top-0 bottom-0 -right-6 w-[2px] bg-pink-deep/50 hidden lg:block"
        aria-hidden="true"
      />
      <div>
        <span className="tag !bg-mint -rotate-[4deg] inline-flex items-center gap-1.5">
          قرطاسية مختارة بعناية
          <Heart className="w-4 h-4" />
        </span>
        <h1 className="mt-5 mb-0 text-[40px] lg:text-[64px] font-extrabold leading-[1.2] tracking-tight">
          دفاترك وأقلامك
          <br />
          وشنطتك،
          <br />
          <span className="relative inline-block text-leaf">
            جاهزة للدراسة
            <svg
              viewBox="0 0 220 14"
              className="absolute -bottom-3 right-0 w-full h-3.5"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M3 9c30-8 52 4 80-1s52-7 80-1 40 2 54-3"
                fill="none"
                stroke="#f198aa"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>
        <p className="lead mt-7 mb-0 max-w-[40ch] lg:text-[19px]">
          دفاتر، أقلام، شنط وألوان — نختارها قطعة قطعة، ونوصلها لباب بيتك قبل
          أول يوم دراسة.
        </p>
        <div className="mt-8 flex flex-col items-start gap-[14px] sm:flex-row sm:flex-wrap">
          <a href="#/shop" className="btn">
            تسوّق الآن
            <ArrowLeft size={20} strokeWidth={2.6} />
          </a>
          <a href="#/school-list" className="btn btn-pink">
            ارفع قائمة المدرسة
            <ClipboardList size={20} strokeWidth={2.4} />
          </a>
        </div>
        <p className="mt-7 mb-0 font-bold text-[16px]">طرق دفع سهلة:</p>
        <p className="m-0 text-ink-soft text-[15px]">
          {PAYMENT_METHODS.join("، ")}
        </p>
      </div>
      <div className="relative mx-auto w-[min(86vw,440px)] aspect-square">
        <div className="absolute inset-0 rounded-full bg-mint border-2 border-ink shadow-[6px_6px_0_var(--color-ink)]" />
        <div className="absolute inset-[10px] rounded-full border-2 border-dashed border-leaf/40" />
        <SleepyCatButton
          onWake={r}
          className="absolute left-1/2 top-1/2 w-[88%] -translate-x-1/2 -translate-y-[calc(50%+38px)]"
        />
        <div className="absolute top-[7%] left-1/2 -translate-x-1/2 bg-card border-2 border-ink rounded-2xl px-4 py-1 text-[16px] font-bold whitespace-nowrap shadow-[3px_3px_0_var(--color-ink)]">
          <span aria-live="polite">{c ? "هلا! أنا مشمش" : "نايم… اضغطني"}</span>
          <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b-2 border-l-2 border-ink -rotate-45" />
        </div>
        <Star className="absolute -top-1 -right-2 w-11 h-11 rotate-12" />
        <PaperClip className="absolute top-[8%] -left-1 w-7 h-14 -rotate-12" />
        <Heart className="absolute top-[30%] -right-3 w-9 h-9 rotate-12" />
        <div className="absolute bottom-[4%] -left-2 w-16 h-16 rotate-[-18deg]">
          <Art kind="eraser" className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title: c, sub: r }) {
  return (
    <div className="text-center mb-8">
      <h2 className="section-title">{c}</h2>
      <Squiggle />
      {r && <p className="lead mt-2 mb-0">{r}</p>}
    </div>
  );
}

function Categories() {
  const { categories: c } = useStore();
  return (
    <section className="wrap py-6" aria-labelledby="cats">
      <div id="cats">
        <SectionTitle title="تسوّق حسب القسم" />
      </div>
      <ul className="list-none p-0 m-0 grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-5">
        {c.map((r) => (
          <li key={r.id}>
            <a
              href={`#/shop?c=${r.id}`}
              className="panel !rounded-[20px] !shadow-[4px_4px_0_var(--color-ink)] flex flex-col items-center gap-1 p-2.5 pb-2 no-underline text-ink transition-transform hover:-translate-y-0.5"
            >
              <span
                className="w-full aspect-square rounded-[14px] border-2 border-ink grid place-items-center"
                style={{
                  background: r.tint,
                }}
              >
                <Art kind={r.art} className="w-[72%] h-[72%]" />
              </span>
              <span className="font-bold text-[15px] leading-tight text-center min-h-[2.5em] grid place-items-center">
                {r.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewArrivals() {
  const { products: c } = useStore();
  const r = c
    .filter((o) => o.badge)
    .concat(c.filter((o) => !o.badge))
    .slice(0, 4);
  return (
    <section className="mt-14" aria-labelledby="new">
      <WavyEdge fill="var(--color-mint-soft)" />
      <div className="bg-mint-soft -my-px py-12">
        <div className="wrap">
          <div id="new">
            <SectionTitle
              title="وصل جديد"
              sub="أحدث اللي نزل على الرفوف — الكميات محدودة."
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {r.map((o) => (
              <ProductCard key={o.id} product={o} />
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="#/shop" className="btn btn-butter">
              شوف كل المنتجات
              <ArrowLeft size={20} strokeWidth={2.6} />
            </a>
          </div>
        </div>
      </div>
      <WavyEdge fill="var(--color-mint-soft)" flip />
    </section>
  );
}

const STEPS = [
  {
    icon: ShoppingBasket,
    title: "تختار",
    body: "من المتجر أو ترفع قائمة المدرسة كاملة.",
  },
  {
    icon: PackageCheck,
    title: "نجهّز",
    body: "نجمع كل قطعة ونتأكد من المقاس واللون.",
  },
  {
    icon: Gift,
    title: "نغلّف",
    body: "في كيس قماش يرجع ينفعك طول السنة.",
  },
  {
    icon: Truck,
    title: "نوصّل",
    body: "لكل مدن المملكة خلال ٢–٤ أيام عمل.",
  },
];

function Steps() {
  return (
    <section className="wrap py-16" aria-labelledby="steps">
      <div id="steps">
        <SectionTitle title="كيف يوصلك طلبك" />
      </div>
      <ol className="list-none p-0 m-0 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {STEPS.map((c, r) => (
          <li key={c.title} className="text-center">
            <span className="mx-auto w-[84px] h-[84px] rounded-full bg-card border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] grid place-items-center">
              <c.icon size={34} strokeWidth={2} className="text-leaf" />
            </span>
            <p className="m-0 mt-3 text-leaf font-bold text-[18px]">
              {(r + 1).toLocaleString("ar-SA", {
                minimumIntegerDigits: 2,
              })}
            </p>
            <h3 className="m-0 text-[22px] font-extrabold">{c.title}</h3>
            <p className="lead m-0 mt-1 text-[16px] max-w-[26ch] mx-auto">
              {c.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SchoolListPromo() {
  return (
    <section className="wrap py-6">
      <div className="panel stitched !bg-lilac !rounded-[28px] relative p-6 pt-10 lg:p-12 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="flower-spin absolute -top-5 -left-5 w-28 h-28"
          aria-hidden="true"
        >
          {[0, 72, 144, 216, 288].map((c) => (
            <ellipse
              key={c}
              cx="50"
              cy="28"
              rx="17"
              ry="22"
              fill="#f7c6cf"
              stroke="#3b3242"
              strokeWidth="3"
              transform={`rotate(${c} 50 50)`}
            />
          ))}
          <circle
            cx="50"
            cy="50"
            r="13"
            fill="#fdecaa"
            stroke="#3b3242"
            strokeWidth="3"
          />
        </svg>
        <div className="relative">
          <span className="tag !bg-butter rotate-[-3deg]">وفّر وقتك</span>
          <h2 className="mt-4 mb-0 text-[30px] lg:text-[40px] font-extrabold leading-tight">
            عندك قائمة أدوات من المدرسة؟
          </h2>
          <p className="mt-3 mb-0 text-[17px] max-w-[44ch]">
            صوّر القائمة وارفعها، ونجهّز لك كل الأدوات في طلب واحد. يوصلك السعر
            للمراجعة قبل ما تدفع.
          </p>
          <a href="#/school-list" className="btn btn-paper mt-6">
            ارفع القائمة
            <ArrowLeft size={20} strokeWidth={2.6} />
          </a>
        </div>
        <ListNote />
      </div>
    </section>
  );
}

function ListNote() {
  const c = [
    "دفتر ٦٠ ورقة × ٤",
    "أقلام رصاص HB",
    "ألوان خشب ١٢",
    "مسطرة ٣٠ سم",
    "صمغ عصا",
  ];
  return (
    <div
      className="relative mx-auto w-[min(78vw,300px)] rotate-[3deg] bg-card border-2 border-ink rounded-md shadow-[6px_6px_0_var(--color-ink)] p-5 pt-7"
      aria-hidden="true"
    >
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-mint/80 border border-ink/20 rotate-[-4deg]" />
      <p className="m-0 font-extrabold text-[18px] border-b-2 border-pink-deep pb-1">
        قائمة الصف الثالث
      </p>
      <ul className="list-none p-0 m-0 mt-2">
        {c.map((r, o) => (
          <li
            key={r}
            className="flex items-center gap-2 py-1 border-b border-dashed border-ink/20 text-[15px]"
          >
            <span
              className={`w-4 h-4 rounded border-2 border-ink grid place-items-center ${o < 3 ? "bg-mint" : ""}`}
            >
              {o < 3 && (
                <span className="block w-1.5 h-2.5 border-ink border-b-2 border-l-2 -rotate-45 -translate-y-px" />
              )}
            </span>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MishmishVideo() {
  const c = useRef(null);
  useEffect(() => {
    const r = c.current;
    if (!r) {
      return;
    }
    const o = window.matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => (o.matches ? r.pause() : void r.play().catch(() => {}));
    f();
    o.addEventListener("change", f);
    return () => o.removeEventListener("change", f);
  }, []);
  return (
    <video
      ref={c}
      src={mishmishVideo}
      className="block w-full h-auto"
      autoPlay
      muted
      loop
      playsInline
      aria-label="مشمش القطو يمشي داخل صورة بولارويد"
    />
  );
}

function About() {
  const [c, r] = useState(false);
  return (
    <section className="wrap pt-16 grid gap-8 lg:grid-cols-2 lg:items-center">
      <figure className="m-0 mx-auto w-[min(72vw,300px)] -rotate-[4deg] relative">
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-mint/80 border border-ink/20 rotate-[3deg] z-10"
          aria-hidden="true"
        />
        {c ? (
          <div className="bg-card border-2 border-ink rounded-[10px] shadow-[6px_6px_0_var(--color-ink)] p-3">
            <Puzzle onDone={() => r(false)} />
          </div>
        ) : (
          <MishmishVideo />
        )}
        <figcaption className="text-center text-[17px] font-bold pt-2">
          {c ? "ركّب الصورة وخلّ مشمش يقوم" : "مشمش حارس المخزن"}
        </figcaption>
      </figure>
      <div>
        <h2 className="m-0 text-[30px] lg:text-[40px] font-extrabold">
          هلا فيك!
        </h2>
        <p className="mt-3 mb-0 text-[17px] text-ink-soft max-w-[48ch]">
          سطر متجر قرطاسية صغير، نحب الورق الحلو والأقلام اللي تكتب بنعومة.
          نجرّب كل منتج قبل ما نعرضه، ونختار اللي يستاهل يرافقك طول السنة
          الدراسية.
        </p>
        <button
          type="button"
          className="btn btn-butter mt-6"
          onClick={() => r((o) => !o)}
        >
          {c ? "رجّع مشمش يمشي" : "العب مع مشمش"}
        </button>
        <p className="mt-3 mb-0 text-[15px] text-ink-soft">— فريق سطر</p>
      </div>
    </section>
  );
}
