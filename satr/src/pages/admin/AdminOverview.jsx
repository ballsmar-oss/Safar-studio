import { formatPrice } from "../../lib/format";
import { useAdminData } from "./useAdminData";

// أرقام سريعة فوق صفحة الطلبات: مبيعات اليوم، الطلبات المفتوحة، والمنتجات اللي قرّبت تخلص
export function AdminOverview({ token }) {
  const { data } = useAdminData("/api/admin/overview", token);
  if (!data) return null;
  const stats = [
    ["طلبات اليوم", data.ordersToday.toLocaleString("ar-SA"), "var(--color-mint)"],
    ["مبيعات اليوم", formatPrice(data.salesToday), "var(--color-butter)"],
    ["طلبات تحتاج تجهيز", data.openOrders.toLocaleString("ar-SA"), "var(--color-pink)"],
    ["كل المبيعات", formatPrice(data.salesTotal), "var(--color-lilac)"],
  ];
  return (
    <div className="grid gap-4 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map(([label, value, tint]) => (
          <div key={label} className="panel !rounded-[20px] p-4" style={{ background: tint }}>
            <p className="m-0 text-[14px] font-bold text-ink-soft">{label}</p>
            <p className="m-0 mt-1 text-[24px] font-extrabold leading-tight">{value}</p>
          </div>
        ))}
      </div>
      {data.awaitingPayment > 0 && (
        <p className="m-0 text-[15px] font-bold">
          {`${data.awaitingPayment.toLocaleString("ar-SA")} طلب بانتظار الدفع الإلكتروني`}
        </p>
      )}
      {data.lowStock.length > 0 && (
        <div className="panel p-4 !bg-card">
          <p className="m-0 font-extrabold">منتجات قرّبت تخلص</p>
          <ul className="list-none p-0 m-0 mt-2 flex flex-wrap gap-2">
            {data.lowStock.map((p) => (
              <li key={p.id} className="chip !min-h-9 !text-[14px] !shadow-none">
                {p.name}
                {" · "}
                {p.stock.toLocaleString("ar-SA")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
