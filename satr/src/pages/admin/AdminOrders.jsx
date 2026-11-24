import { useState } from "react";
import { ORDER_STATUS } from "../../components/Order";
import { api } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { useAdminData } from "./useAdminData";

export function AdminOrders({ token: c }) {
  const [r, o] = useState(0);
  const { data: f, error: g } = useAdminData("/api/admin/orders", c, r);
  const { data: carriers } = useAdminData("/api/admin/carriers", c);
  const [filter, setFilter] = useState("all");
  const [m, b] = useState(null);
  const [S, y] = useState("");
  const h = async (E, z, Q) => {
    b(E);
    y("");
    try {
      await api(z, {
        method: Q === undefined ? "POST" : "PATCH",
        json: Q,
        token: c,
      });
      o((Z) => Z + 1);
    } catch (Z) {
      y(Z instanceof Error ? Z.message : "صار خطأ");
    } finally {
      b(null);
    }
  };
  if (g) {
    return (
      <p role="alert" className="font-bold text-[#b0354f]">
        {g}
      </p>
    );
  } else if (f) {
    if (f.length === 0) {
      return <p className="lead">ما فيه طلبات لين الحين.</p>;
    } else {
      return (
        <div className="grid gap-4">
          {S && (
            <p role="alert" className="font-bold text-[#b0354f]">
              {S}
            </p>
          )}
          <label className="flex items-center gap-2 text-[15px] font-bold justify-self-start">
            عرض
            <select className="field !w-auto !min-h-11" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">كل الطلبات ({f.length.toLocaleString("ar-SA")})</option>
              {Object.keys(ORDER_STATUS).map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS[s]} ({f.filter((o) => o.status === s).length.toLocaleString("ar-SA")})
                </option>
              ))}
            </select>
          </label>
          {f.filter((E) => filter === "all" || E.status === filter).map((E) => (
            <article key={E.id} className="panel p-5 grid gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="m-0 font-extrabold text-[18px]" dir="ltr">
                  {E.number}
                </p>
                <p className="m-0 font-bold">{formatPrice(E.total)}</p>
              </div>
              {E.createdAt && (
                <p className="m-0 -mt-2 text-[13px] text-ink-soft">
                  {new Date(E.createdAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
              <p className="m-0 text-[15px]">
                {E.customer.name}
                {" · "}
                <span dir="ltr">{E.customer.phone}</span>
                {" · "}
                {E.customer.city}
                {"، "}
                {E.customer.district}
              </p>
              <p className="m-0 text-[15px] text-ink-soft">
                {E.customer.address}
              </p>
              <ul className="list-none p-0 m-0 text-[15px]">
                {E.items.map((z) => (
                  <li key={z.id}>
                    {z.name}
                    {z.color && ` (${z.color})`}
                    {" × "}
                    {z.qty}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-[15px] font-bold">
                  الحالة
                  <select
                    className="field !w-auto !min-h-11"
                    value={E.status}
                    disabled={m === E.id}
                    onChange={(z) =>
                      h(E.id, `/api/admin/orders/${E.id}`, {
                        status: z.target.value,
                      })
                    }
                  >
                    {Object.keys(ORDER_STATUS).map((z) => (
                      <option key={z} value={z}>
                        {ORDER_STATUS[z]}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="text-[15px]">
                  {"الدفع: "}
                  <b>
                    {E.paymentMethod === "cod"
                      ? "عند الاستلام"
                      : E.paymentStatus === "paid"
                        ? "مدفوع"
                        : "بانتظار الدفع"}
                  </b>
                  {E.paymentProvider && ` (${E.paymentProvider === "tabby" ? "تابي" : "ميسّر"})`}
                </span>
                {E.paymentMethod === "cod" &&
                  E.paymentStatus !== "paid" &&
                  E.status !== "cancelled" && (
                    <button
                      className="btn btn-sm btn-butter"
                      disabled={m === E.id}
                      onClick={() =>
                        h(E.id, `/api/admin/orders/${E.id}/mark-paid`)
                      }
                    >
                      تم التحصيل
                    </button>
                  )}
                <a
                  className="btn btn-sm btn-paper"
                  href={`https://wa.me/966${E.customer.phone.replace(/^0/, "")}?text=${encodeURIComponent(`هلا ${E.customer.name}، بخصوص طلبك ${E.number} من متجر سطر`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  واتساب العميل
                </a>
              </div>
              <ShipmentEditor
                order={E}
                carriers={carriers ?? []}
                busy={m === E.id}
                onSave={(shipment) => h(E.id, `/api/admin/orders/${E.id}`, shipment)}
              />
            </article>
          ))}
        </div>
      );
    }
  } else {
    return <p className="lead">جاري التحميل…</p>;
  }
}

// شركة الشحن ورقم الشحنة: يظهر للعميل رابط التتبع، ويروح في رسالة الشحن
function ShipmentEditor({ order, carriers, busy, onSave }) {
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [number, setNumber] = useState(order.trackingNumber ?? "");
  const changed = (order.carrier ?? "") !== carrier || (order.trackingNumber ?? "") !== number;
  const options = carrier && !carriers.includes(carrier) ? [carrier, ...carriers] : carriers;
  return (
    <div className="flex flex-wrap items-center gap-2 border-t-2 border-dashed border-ink/15 pt-3">
      <span className="text-[15px] font-bold">الشحنة</span>
      <select
        className="field !w-auto !min-h-11"
        aria-label="شركة الشحن"
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
      >
        <option value="">بدون</option>
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        className="field !w-44 !min-h-11"
        aria-label="رقم الشحنة"
        placeholder="رقم الشحنة"
        dir="ltr"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <button
        className="btn btn-sm"
        disabled={busy || !changed}
        onClick={() => onSave({ carrier, trackingNumber: number })}
      >
        حفظ
      </button>
      {order.trackingUrl && (
        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[15px] font-bold text-leaf">
          تتبّع ↗
        </a>
      )}
    </div>
  );
}
