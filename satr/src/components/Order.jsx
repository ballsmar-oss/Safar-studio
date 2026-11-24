import { formatPrice } from "../lib/format";

export const ORDER_STATUS = {
  new: "استلمنا طلبك",
  preparing: "نجهّز طلبك",
  shipped: "طلبك في الطريق",
  delivered: "وصل",
  cancelled: "ملغي",
};

const STATUS_STEPS = ["new", "preparing", "shipped", "delivered"];

const PAYMENT_STATUS = {
  paid: "مدفوع",
  awaiting_payment: "بانتظار الدفع",
  cod: "تدفع عند الاستلام",
};

export function OrderProgress({ status: c }) {
  if (c === "cancelled") {
    return (
      <p className="m-0 font-bold text-[#b0354f]">{ORDER_STATUS.cancelled}</p>
    );
  }
  const r = STATUS_STEPS.indexOf(c);
  return (
    <ol
      className="list-none p-0 m-0 grid grid-cols-4 gap-2"
      aria-label="حالة الطلب"
    >
      {STATUS_STEPS.map((o, f) => (
        <li
          key={o}
          className="text-center"
          aria-current={f === r ? "step" : undefined}
        >
          <span
            className={`mx-auto grid place-items-center w-9 h-9 rounded-full border-2 border-ink font-bold ${f <= r ? "bg-mint" : "bg-card"} ${f === r ? "shadow-[3px_3px_0_var(--color-ink)]" : ""}`}
          >
            {(f + 1).toLocaleString("ar-SA")}
          </span>
          <span className="block mt-1.5 text-[13px] font-bold leading-tight">
            {ORDER_STATUS[o]}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function OrderSummary({ order: c }) {
  return (
    <div className="panel p-6 sm:p-8 grid gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="m-0 text-[15px] text-ink-soft">رقم الطلب</p>
        <p className="m-0 font-extrabold text-[22px] tracking-wide" dir="ltr">
          {c.number}
        </p>
      </div>
      <OrderProgress status={c.status} />
      <p className="m-0 text-[15px]">
        {"الدفع: "}
        <b>{PAYMENT_STATUS[c.paymentStatus] ?? c.paymentStatus}</b>
        {c.paymentMethod === "online" &&
          c.paymentStatus !== "paid" &&
          " — إذا ما دفعت بعد، رجّع لصفحة الدفع من الطلب الجديد"}
      </p>
      {c.trackingNumber && (
        <p className="m-0 text-[15px]">
          {"الشحنة: "}
          <b>{c.carrier}</b>
          {" · "}
          {c.trackingUrl ? (
            <a href={c.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-leaf" dir="ltr">
              {c.trackingNumber}
            </a>
          ) : (
            <b dir="ltr">{c.trackingNumber}</b>
          )}
        </p>
      )}
      <ul className="list-none p-0 m-0 grid gap-2 border-t-2 border-dashed border-ink/20 pt-4">
        {c.items.map((r) => (
          <li key={r.id} className="flex justify-between gap-3 text-[16px]">
            <span>
              {r.name}
              {" × "}
              {r.qty.toLocaleString("ar-SA")}
            </span>
            <span className="font-bold">{formatPrice(r.price * r.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="m-0 grid grid-cols-2 gap-y-1.5 text-[16px] border-t-2 border-dashed border-ink/20 pt-4">
        <dt>التوصيل</dt>
        <dd className="m-0 text-left">
          {c.shipping ? formatPrice(c.shipping) : "مجاني"}
        </dd>
        <dt className="font-extrabold text-[18px]">الإجمالي</dt>
        <dd className="m-0 text-left font-extrabold text-[18px]">
          {formatPrice(c.total)}
        </dd>
      </dl>
    </div>
  );
}
