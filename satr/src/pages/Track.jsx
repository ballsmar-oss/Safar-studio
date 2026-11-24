import { useState } from "react";
import { Cat } from "../components/Cat";
import { Squiggle } from "../components/Decor";
import { Field } from "../components/Field";
import { OrderSummary } from "../components/Order";
import { ApiError, api } from "../lib/api";

export function TrackPage({ prefill: c }) {
  const [r, o] = useState(c ?? "");
  const [f, g] = useState("");
  const [m, b] = useState(null);
  const [S, y] = useState("");
  const [h, E] = useState(false);
  const z = async (Q) => {
    Q.preventDefault();
    E(true);
    y("");
    try {
      b(
        await api("/api/orders/track", {
          method: "POST",
          json: {
            number: r.trim(),
            phone: f.trim(),
          },
        }),
      );
    } catch (Z) {
      b(null);
      y(Z instanceof ApiError ? Z.message : "صار خطأ، جرّب مرة ثانية.");
    } finally {
      E(false);
    }
  };
  return (
    <section className="wrap pt-10 max-w-[720px]">
      <div className="text-center">
        <h1 className="section-title !text-[36px]">تتبع طلبك</h1>
        <Squiggle />
        <p className="lead mt-2 mb-0">اكتب رقم الطلب والجوال اللي طلبت فيه.</p>
      </div>
      <form
        className="panel p-6 sm:p-8 mt-8 grid gap-5 sm:grid-cols-2"
        onSubmit={z}
        noValidate
      >
        <Field
          id="t-number"
          label="رقم الطلب"
          dir="ltr"
          placeholder="SA-260101-1234"
          autoComplete="off"
          spellCheck={false}
          value={r}
          onChange={(Q) => o(Q.target.value)}
          required
        />
        <Field
          id="t-phone"
          label="رقم الجوال"
          type="tel"
          dir="ltr"
          placeholder="05xxxxxxxx"
          autoComplete="off"
          inputMode="tel"
          value={f}
          onChange={(Q) => g(Q.target.value)}
          required
        />
        <div className="sm:col-span-2">
          <button className="btn" disabled={h}>
            {h ? "جاري البحث…" : "تابع الطلب"}
          </button>
        </div>
        {S && (
          <p
            role="alert"
            className="m-0 sm:col-span-2 font-bold text-[#b0354f]"
          >
            {S}
          </p>
        )}
      </form>
      {m && (
        <div className="mt-8">
          <OrderSummary order={m} />
        </div>
      )}
      {!m && !S && (
        <Cat awake={false} className="w-40 mx-auto mt-10 opacity-90" />
      )}
    </section>
  );
}
