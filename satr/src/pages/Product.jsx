import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, Truck } from "lucide-react";
import { ProductArt } from "../components/Art";
import { CatalogState } from "../components/CatalogState";
import { ProductCard } from "../components/ProductCard";
import { QtyStepper } from "../components/QtyStepper";
import { WavyFrame } from "../components/WavyFrame";
import { formatPrice } from "../lib/format";
import { useStore } from "../lib/store";
import { NotFoundPage } from "./NotFound";
import { track } from "../lib/tracking";

export function ProductPage({ id: c }) {
  const {
    products: r,
    categories: o,
    add: f,
    setPanel: g,
    catalog: m,
    shipping,
  } = useStore();
  const [b, S] = useState(1);
  const [y, h] = useState();
  const viewed = m.status === "ready" ? r.find((w) => w.id === c) : undefined;
  useEffect(() => {
    if (viewed) {
      track("view_item", {
        value: viewed.price,
        items: [{ id: viewed.id, name: viewed.name, price: viewed.price, qty: 1 }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewed?.id]);
  if (m.status !== "ready") {
    return <CatalogState catalog={m} />;
  }
  const E = r.find((w) => w.id === c);
  if (!E) {
    return <NotFoundPage />;
  }
  const z = E.colors ?? [];
  const Q = y && z.includes(y) ? y : z[0];
  const Z = z.length > 0 && !Q;
  const O = o.find((w) => w.id === E.category);
  const C = r
    .filter((w) => w.category === E.category && w.id !== E.id)
    .slice(0, 4);
  return (
    <section className="wrap pt-6">
      <a
        href={`#/shop?c=${E.category}`}
        className="inline-flex items-center gap-1.5 text-ink font-bold no-underline min-h-11"
      >
        <ArrowRight size={18} />
        {O?.name}
      </a>
      <div className="mt-3 grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-start">
        <div
          className="panel !rounded-[28px] aspect-square relative overflow-hidden"
          style={{
            background: E.tint,
          }}
        >
          <WavyFrame />
          <div className="absolute inset-[9%]">
            <ProductArt product={E} />
          </div>
        </div>
        <div>
          {E.badge && (
            <span className="tag !bg-butter -rotate-3">{E.badge}</span>
          )}
          <h1 className="mt-4 mb-0 text-[32px] lg:text-[44px] font-extrabold leading-tight">
            {E.name}
          </h1>
          <p className="mt-2 mb-0 text-[26px] font-extrabold">
            {formatPrice(E.price)}
            {E.oldPrice && (
              <s className="text-[17px] text-ink-soft font-normal mr-3">
                {formatPrice(E.oldPrice)}
              </s>
            )}
          </p>
          <p className="lead mt-4 mb-0 max-w-[46ch]">{E.description}</p>
          {(E.brand || E.madeIn) && (
            <dl className="mt-4 mb-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[16px]">
              {E.brand && (
                <>
                  <dt className="text-ink-soft">الشركة</dt>
                  <dd className="m-0 font-bold">{E.brand}</dd>
                </>
              )}
              {E.madeIn && (
                <>
                  <dt className="text-ink-soft">بلد الصنع</dt>
                  <dd className="m-0 font-bold">{E.madeIn}</dd>
                </>
              )}
            </dl>
          )}
          {z.length > 0 && (
            <fieldset className="mt-6 border-0 p-0 m-0">
              <legend className="label">اختر اللون</legend>
              <div className="flex flex-wrap gap-2.5">
                {z.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className="chip !min-h-11"
                    aria-pressed={Q === w}
                    onClick={() => h(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <ul className="mt-4 mb-0 p-0 list-none flex flex-wrap gap-2">
            {E.details.map((w) => (
              <li key={w} className="chip !min-h-9 !text-[14px] !shadow-none">
                {w}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3 items-center">
            <QtyStepper
              value={b}
              onChange={(w) => S(Math.max(1, w))}
              label={E.name}
            />
            <button
              className="btn btn-pink flex-1 lg:flex-none lg:px-12"
              disabled={Z || E.stock <= 0}
              onClick={() => {
                f(E.id, b, Q);
                g("cart");
              }}
            >
              {E.stock <= 0
                ? "خلص من المخزون"
                : Z
                  ? "اختر اللون أولاً"
                  : "أضف للسلة"}
            </button>
          </div>
          <ul className="mt-8 p-0 list-none grid gap-3 text-[15px]">
            <li className="flex items-center gap-3">
              <Truck
                size={22}
                className="text-leaf shrink-0"
                aria-hidden="true"
              />
              توصيل لكل مدن المملكة خلال ٢–٤ أيام عمل
              {shipping.fee > 0
                ? `، ومجاني فوق ${shipping.freeMin.toLocaleString("ar-SA")} ر.س.`
                : "، ومجاني لكل الطلبات."}
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw
                size={22}
                className="text-leaf shrink-0"
                aria-hidden="true"
              />
              استرجاع خلال ٧ أيام إذا المنتج ما انفتح.
            </li>
          </ul>
        </div>
      </div>
      {C.length > 0 && (
        <div className="mt-16">
          <h2 className="text-[26px] font-extrabold m-0 mb-5">من نفس القسم</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {C.map((w) => (
              <ProductCard key={w.id} product={w} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
