import { useState } from "react";
import { ORDER_STATUS } from "../../components/Order";
import { api } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { useAdminData } from "./useAdminData";

export function AdminOrders({ token: c }) {
  const [r, o] = useState(0);
  const { data: f, error: g } = useAdminData("/api/admin/orders", c, r);
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
          {f.map((E) => (
            <article key={E.id} className="panel p-5 grid gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="m-0 font-extrabold text-[18px]" dir="ltr">
                  {E.number}
                </p>
                <p className="m-0 font-bold">{formatPrice(E.total)}</p>
              </div>
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
              </div>
            </article>
          ))}
        </div>
      );
    }
  } else {
    return <p className="lead">جاري التحميل…</p>;
  }
}
