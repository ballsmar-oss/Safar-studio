import { useState } from "react";
import { Squiggle } from "../../components/Decor";
import { Field } from "../../components/Field";
import { ApiError, api } from "../../lib/api";
import { AdminOrders } from "./AdminOrders";
import { AdminProducts } from "./AdminProducts";
import { AdminIntegrations } from "./AdminIntegrations";
import { AdminOverview } from "./AdminOverview";
import { AdminSchoolLists } from "./AdminSchoolLists";
import { AdminSettings } from "./AdminSettings";

const TOKEN_KEY = "satr-admin-token";

export function AdminPage() {
  const [c, r] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [o, f] = useState(false);
  const [g, m] = useState("");
  const b = async (y) => {
    f(true);
    m("");
    try {
      await api("/api/admin/status", {
        token: y,
      });
      try {
        sessionStorage.setItem(TOKEN_KEY, y);
      } catch {}
      r(y);
    } catch (h) {
      m(h instanceof ApiError ? h.message : "ما قدرنا نتحقق من التوكن");
    } finally {
      f(false);
    }
  };
  const S = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
    r(null);
  };
  if (c) {
    return <AdminDashboard token={c} onSignOut={S} />;
  } else {
    return <AdminLogin onSubmit={b} busy={o} error={g} />;
  }
}

function AdminLogin({ onSubmit: c, busy: r, error: o }) {
  const [f, g] = useState("");
  const m = (b) => {
    b.preventDefault();
    if (f.trim()) {
      c(f.trim());
    }
  };
  return (
    <section className="wrap pt-14 max-w-[460px]">
      <div className="text-center">
        <h1 className="section-title !text-[30px]">لوحة الإدارة</h1>
        <Squiggle />
      </div>
      <form
        className="panel p-6 sm:p-8 mt-8 grid gap-5"
        onSubmit={m}
        noValidate
      >
        <Field
          id="admin-token"
          label="التوكن"
          type="password"
          autoComplete="current-password"
          value={f}
          onChange={(b) => g(b.target.value)}
          dir="ltr"
        />
        {o && (
          <p role="alert" className="m-0 font-bold text-[#b0354f]">
            {o}
          </p>
        )}
        <button className="btn" disabled={r}>
          {r ? "جاري التحقق…" : "دخول"}
        </button>
      </form>
    </section>
  );
}

function AdminDashboard({ token: c, onSignOut: r }) {
  const [o, f] = useState("orders");
  return (
    <section className="wrap pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-[30px] font-extrabold">لوحة الإدارة</h1>
        <button className="btn btn-paper btn-sm" onClick={r}>
          خروج
        </button>
      </div>
      <nav
        className="flex gap-2 mt-6 overflow-x-auto pb-1"
        aria-label="أقسام الإدارة"
      >
        {[
          ["orders", "الطلبات"],
          ["products", "المنتجات"],
          ["lists", "قوائم المدارس"],
          ["integrations", "التكاملات"],
          ["settings", "الإعدادات"],
        ].map(([g, m]) => (
          <button
            key={g}
            className="chip"
            aria-pressed={o === g}
            onClick={() => f(g)}
          >
            {m}
          </button>
        ))}
      </nav>
      <div className="mt-6">
        {o === "orders" && (
          <>
            <AdminOverview token={c} />
            <AdminOrders token={c} />
          </>
        )}
        {o === "products" && <AdminProducts token={c} />}
        {o === "lists" && <AdminSchoolLists token={c} />}
        {o === "integrations" && <AdminIntegrations token={c} />}
        {o === "settings" && <AdminSettings token={c} />}
      </div>
    </section>
  );
}
