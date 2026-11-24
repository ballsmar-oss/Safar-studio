import { useEffect, useState } from "react";
import { Squiggle } from "../components/Decor";
import { OrderProgress } from "../components/Order";
import { api } from "../lib/api";

export function OrderPage({ number: c }) {
  const [r, o] = useState({
    status: "loading",
  });
  useEffect(() => {
    let f = true;
    api(`/api/orders/${encodeURIComponent(c)}`)
      .then(
        (g) =>
          f &&
          o({
            status: "ready",
            order: g,
          }),
      )
      .catch(
        (g) =>
          f &&
          o({
            status: "error",
            message: g.message,
          }),
      );
    return () => {
      f = false;
    };
  }, [c]);
  return (
    <section className="wrap pt-10 max-w-[640px]">
      {r.status === "loading" && (
        <p className="lead text-center">جاري تحميل الطلب…</p>
      )}
      {r.status === "error" && (
        <div className="text-center">
          <h1 className="text-[26px] font-extrabold m-0">{r.message}</h1>
          <a href="#/track" className="btn mt-6">
            تتبع طلب ثاني
          </a>
        </div>
      )}
      {r.status === "ready" && (
        <div className="grid gap-6">
          <div className="text-center">
            <h1 className="section-title !text-[32px]">شكراً! استلمنا طلبك</h1>
            <Squiggle />
          </div>
          <div className="panel p-6 sm:p-8 grid gap-6">
            <p
              className="m-0 font-extrabold text-[22px] tracking-wide text-center"
              dir="ltr"
            >
              {r.order.number}
            </p>
            <OrderProgress status={r.order.status} />
            <p className="m-0 text-center text-[15px]">
              {r.order.paymentStatus === "awaiting_payment"
                ? "لم نستلم الدفع بعد. إذا انقطعت أثناء الدفع، ارجع لصفحة الدفع من جديد."
                : r.order.paymentMethod === "cod"
                  ? "بندفع عند الاستلام، ما تحتاج تسوي شي الحين."
                  : "تم الدفع، شكراً لك."}
            </p>
          </div>
          <div className="text-center">
            <a href="#/track" className="btn btn-paper">
              تابع طلبك لاحقاً بالجوال
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
