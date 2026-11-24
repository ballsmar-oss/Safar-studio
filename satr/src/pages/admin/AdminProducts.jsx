import { useState } from "react";
import { api } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { ProductForm } from "./ProductForm";
import { useAdminData } from "./useAdminData";

export function AdminProducts({ token: c }) {
  const [r, o] = useState(0);
  const { data: f, error: g } = useAdminData("/api/admin/products", c, r);
  const [m, b] = useState(null);
  if (g) {
    return (
      <p role="alert" className="font-bold text-[#b0354f]">
        {g}
      </p>
    );
  }
  if (!f) {
    return <p className="lead">جاري التحميل…</p>;
  }
  const S = () => {
    b(null);
    o((y) => y + 1);
  };
  return (
    <div className="grid gap-6">
      {m ? (
        <ProductForm
          token={c}
          categories={f.categories}
          product={
            m.mode === "edit"
              ? f.products.find((y) => y.id === m.id)
              : undefined
          }
          onDone={S}
          onCancel={() => b(null)}
        />
      ) : (
        <button
          className="btn justify-self-start"
          onClick={() =>
            b({
              mode: "new",
            })
          }
        >
          منتج جديد
        </button>
      )}
      <div className="grid gap-3">
        {f.products.map((y) => (
          <AdminProductRow
            key={y.id}
            product={y}
            token={c}
            onEdit={() =>
              b({
                mode: "edit",
                id: y.id,
              })
            }
            onChanged={() => o((h) => h + 1)}
          />
        ))}
      </div>
    </div>
  );
}

function AdminProductRow({ product: c, token: r, onEdit: o, onChanged: f }) {
  const [g, m] = useState(false);
  const [b, S] = useState("");
  const y = async () => {
    m(true);
    S("");
    try {
      await api(`/api/admin/products/${c.id}/active`, {
        method: "POST",
        json: {
          active: !(c.active ?? true),
        },
        token: r,
      });
      f();
    } catch (E) {
      S(E instanceof Error ? E.message : "صار خطأ");
    } finally {
      m(false);
    }
  };
  const h = c.active === false;
  return (
    <article
      className={`panel p-4 flex flex-wrap items-center gap-3 ${h ? "opacity-60" : ""}`}
    >
      <span
        className="w-12 h-12 rounded-xl border-2 border-ink shrink-0"
        style={{
          background: c.tint,
        }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-[180px]">
        <p className="m-0 font-bold">{c.name}</p>
        <p className="m-0 text-[14px] text-ink-soft">
          {formatPrice(c.price)}
          {" · المخزون "}
          {c.stock.toLocaleString("ar-SA")}
          {h && " · مخفي"}
        </p>
        {b && <p className="m-0 text-[14px] font-bold text-[#b0354f]">{b}</p>}
      </div>
      <button className="btn btn-sm btn-paper" onClick={o}>
        تعديل
      </button>
      <button className="btn btn-sm" disabled={g} onClick={y}>
        {h ? "إظهار" : "إخفاء"}
      </button>
    </article>
  );
}
