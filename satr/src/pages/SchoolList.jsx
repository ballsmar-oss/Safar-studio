import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus } from "lucide-react";
import { Art } from "../components/Art";
import { Cat } from "../components/Cat";
import { Squiggle } from "../components/Decor";
import { Field } from "../components/Field";
import { ApiError, api, fileToDataUrl } from "../lib/api";
import { isSaudiMobile } from "../lib/validate";

const STAGES = [
  {
    id: "kg",
    name: "روضة",
    art: "crayons",
    tint: "var(--color-butter)",
  },
  {
    id: "primary",
    name: "ابتدائي",
    art: "pencil",
    tint: "var(--color-pink)",
  },
  {
    id: "middle",
    name: "متوسط",
    art: "geometry",
    tint: "var(--color-mint)",
  },
  {
    id: "high",
    name: "ثانوي",
    art: "highlighter",
    tint: "var(--color-lilac)",
  },
];

const LIST_STEPS = ["القائمة", "بياناتك", "تم"];

const MAX_UPLOAD = 7340032;

export function SchoolListPage() {
  const [c, r] = useState(0);
  const [o, f] = useState(null);
  const [g, m] = useState(null);
  const [b, S] = useState("");
  const [y, h] = useState("");
  const [E, z] = useState("");
  const [Q, Z] = useState("");
  const [O, C] = useState(false);
  const [w, Y] = useState(null);
  const J = () => {
    if (c === 0) {
      if (o) {
        if (!g && !b.trim()) {
          return Z("ارفع صورة القائمة أو اكتب الأدوات المطلوبة.");
        } else if (g && g.size > MAX_UPLOAD) {
          return Z("الملف أكبر من 7 ميجا، صغّره أو صوّر القائمة بجودة أقل.");
        } else {
          Z("");
          return r(1);
        }
      } else {
        return Z("اختر المرحلة الدراسية عشان نجهّز الأدوات المناسبة.");
      }
    }
    et();
  };
  const et = async () => {
    if (y.trim().length < 2) {
      return Z("اكتب اسمك");
    }
    if (!isSaudiMobile(E)) {
      return Z("رقم الجوال لازم يبدأ بـ 05 ويكون 10 أرقام");
    }
    Z("");
    C(true);
    try {
      const K = g ? await fileToDataUrl(g) : undefined;
      const W = await api("/api/school-lists", {
        method: "POST",
        json: {
          name: y.trim(),
          phone: E,
          stage: o,
          text: b,
          file: K,
        },
      });
      Y(W.id);
      r(2);
    } catch (K) {
      Z(K instanceof ApiError ? K.message : "صار خطأ، جرّب مرة ثانية.");
    } finally {
      C(false);
    }
  };
  return (
    <section className="wrap pt-10 max-w-[760px]">
      <div className="text-center">
        <h1 className="section-title !text-[36px]">قائمة المدرسة</h1>
        <Squiggle />
        <p className="lead mt-2 mb-0">
          ارفع القائمة، ونرسل لك السعر للمراجعة قبل ما تدفع.
        </p>
      </div>
      <ol
        className="list-none p-0 mt-8 mb-6 flex items-center justify-center gap-0"
        aria-label="خطوات الطلب"
      >
        {LIST_STEPS.map((K, W) => (
          <li
            key={K}
            className="flex items-center"
            aria-current={W === c ? "step" : undefined}
          >
            <div className="flex flex-col items-center gap-1 w-20">
              <span
                className={`w-9 h-9 rounded-full border-2 border-ink grid place-items-center font-bold ${W < c ? "bg-mint" : W === c ? "bg-pink" : "bg-card"}`}
              >
                {W < c ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  (W + 1).toLocaleString("ar-SA")
                )}
              </span>
              <span className="text-[14px] font-bold">{K}</span>
            </div>
            {W < LIST_STEPS.length - 1 && (
              <span className="w-10 sm:w-16 border-t-2 border-dashed border-ink/40 -mt-6" />
            )}
          </li>
        ))}
      </ol>
      <div className="panel stitched !rounded-[28px] p-6 sm:p-8">
        {c === 0 && (
          <div className="relative grid gap-7">
            <fieldset className="border-0 p-0 m-0">
              <legend className="label">المرحلة الدراسية</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STAGES.map((K) => (
                  <button
                    key={K.id}
                    type="button"
                    aria-pressed={o === K.id}
                    onClick={() => f(K.id)}
                    className={`flex flex-col items-center gap-1 rounded-[18px] border-2 border-ink p-3 transition-[transform,box-shadow] duration-150 ${o === K.id ? "shadow-[4px_4px_0_var(--color-ink)] -translate-x-0.5 -translate-y-0.5" : "bg-card"}`}
                    style={
                      o === K.id
                        ? {
                            background: K.tint,
                          }
                        : undefined
                    }
                  >
                    <Art kind={K.art} className="w-12 h-12" />
                    <span className="font-bold text-[16px]">{K.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <span className="label">صورة القائمة</span>
              <label className="flex flex-col items-center justify-center gap-2 min-h-36 rounded-[18px] border-2 border-dashed border-ink bg-mint-soft cursor-pointer text-center p-4 focus-within:outline focus-within:outline-3 focus-within:outline-leaf">
                <ImagePlus
                  size={30}
                  strokeWidth={2}
                  className="text-leaf"
                  aria-hidden="true"
                />
                <span className="font-bold">
                  {g ? g.name : "اضغط وارفع صورة أو PDF"}
                </span>
                <span className="text-[14px] text-ink-soft">حتى ٧ ميجا</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="sr-only"
                  onChange={(K) => m(K.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div>
              <label className="label" htmlFor="list-text">
                أو اكتب الأدوات
              </label>
              <textarea
                id="list-text"
                className="field min-h-32 resize-y leading-relaxed"
                placeholder="مثلًا: ٤ دفاتر ٦٠ ورقة مسطّرة، ألوان خشب ١٢ لون، مقص أطفال…"
                value={b}
                onChange={(K) => S(K.target.value)}
              />
            </div>
          </div>
        )}
        {c === 1 && (
          <div className="relative grid gap-5 sm:grid-cols-2">
            <Field
              id="l-name"
              label="الاسم"
              autoComplete="name"
              value={y}
              onChange={(K) => h(K.target.value)}
            />
            <Field
              id="l-phone"
              label="رقم الجوال"
              type="tel"
              autoComplete="tel"
              placeholder="05xxxxxxxx"
              dir="ltr"
              value={E}
              onChange={(K) => z(K.target.value)}
            />
          </div>
        )}
        {c === 2 && (
          <div className="relative text-center py-4">
            <Cat awake className="w-28 mx-auto" />
            <h2 className="text-[26px] font-extrabold mt-4 mb-1">
              استلمنا قائمتك
            </h2>
            <p className="lead m-0">
              {"رقم المرجع "}
              <b dir="ltr">#{w}</b>. بنرسل لك السعر على الواتساب خلال ساعتين في
              أوقات الدوام.
            </p>
            <a href="#/shop" className="btn btn-butter mt-6">
              كمّل تسوّق
            </a>
          </div>
        )}
        {Q && (
          <p
            role="alert"
            className="relative mt-5 mb-0 text-[15px] font-bold text-[#b0354f]"
          >
            {Q}
          </p>
        )}
        {c < 2 && (
          <div className="relative mt-7 flex items-center justify-between gap-3">
            <button className="btn" onClick={J} disabled={O}>
              {O ? "جاري الإرسال…" : c === 1 ? "أرسل القائمة" : "التالي"}
              <ArrowLeft size={20} strokeWidth={2.6} />
            </button>
            {c > 0 && (
              <button
                className="btn btn-paper btn-sm"
                onClick={() => r((K) => K - 1)}
                disabled={O}
              >
                <ArrowRight size={18} />
                رجوع
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
