import { useState } from "react";
import { ProductArt } from "../components/Art";
import { SleepingCat } from "../components/Cat";
import { CatalogState } from "../components/CatalogState";
import { Squiggle } from "../components/Decor";
import { Field } from "../components/Field";
import { ApiError, api } from "../lib/api";
import { FREE_SHIPPING_MIN, SHIPPING_FEE, formatPrice } from "../lib/format";
import { useStore } from "../lib/store";
import { isSaudiMobile } from "../lib/validate";

function validateAddress(c) {
  const r = {};
  if (c.name.trim().length < 2) {
    r.name = "اكتب اسمك";
  }
  if (!isSaudiMobile(c.phone)) {
    r.phone = "رقم الجوال لازم يبدأ بـ 05 ويكون 10 أرقام";
  }
  if (c.city.trim().length < 2) {
    r.city = "اكتب المدينة";
  }
  if (c.district.trim().length < 2) {
    r.district = "اكتب الحي";
  }
  if (c.address.trim().length < 3) {
    r.address = "اكتب الشارع ورقم المبنى";
  }
  return r;
}

export function CheckoutPage() {
  const {
    lines: c,
    subtotal: r,
    clear: o,
    catalog: f,
    onlinePayment: g,
  } = useStore();
  const [m, b] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
  });
  const [S, y] = useState({});
  const [h, E] = useState("cod");
  const [z, Q] = useState(false);
  const [Z, O] = useState("");
  if (f.status !== "ready") {
    return <CatalogState catalog={f} />;
  }
  const C = r >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const w = (J) => (et) => {
    b((K) => ({
      ...K,
      [J]: et.target.value,
    }));
    y((K) => ({
      ...K,
      [J]: undefined,
    }));
  };
  if (c.length === 0) {
    return (
      <section className="wrap py-16 text-center">
        <SleepingCat className="w-32 mx-auto" />
        <h1 className="text-[30px] font-extrabold mt-4 mb-1">السلة فاضية</h1>
        <p className="lead m-0">
          أضف منتجات من المتجر وبعدها كمّل الطلب من هنا.
        </p>
        <a href="#/shop" className="btn mt-6">
          تسوّق الآن
        </a>
      </section>
    );
  }
  const Y = async (J) => {
    J.preventDefault();
    const et = validateAddress(m);
    y(et);
    if (Object.keys(et).length) {
      O("في حقول ناقصة، راجعها تحت.");
      return;
    }
    O("");
    Q(true);
    try {
      const K = await api("/api/orders", {
        method: "POST",
        json: {
          items: c.map((W) => ({
            id: W.id,
            qty: W.qty,
            color: W.color,
          })),
          customer: m,
          payment: h,
        },
      });
      o();
      if (K.paymentUrl) {
        window.location.href = K.paymentUrl;
        return;
      }
      window.location.hash = `#/order/${K.number}`;
    } catch (K) {
      O(K instanceof ApiError ? K.message : "صار خطأ، جرّب مرة ثانية.");
      Q(false);
    }
  };
  return (
    <section className="wrap pt-10">
      <div className="text-center">
        <h1 className="section-title !text-[36px]">إتمام الطلب</h1>
        <Squiggle />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <form
          id="checkout-form"
          className="panel p-6 sm:p-8 grid gap-5"
          onSubmit={Y}
          noValidate
        >
          <h2 className="m-0 text-[22px] font-extrabold">عنوان التوصيل</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="c-name"
              label="الاسم"
              autoComplete="name"
              value={m.name}
              onChange={w("name")}
              error={S.name}
            />
            <Field
              id="c-phone"
              label="رقم الجوال"
              type="tel"
              autoComplete="tel"
              placeholder="05xxxxxxxx"
              dir="ltr"
              value={m.phone}
              onChange={w("phone")}
              error={S.phone}
            />
            <Field
              id="c-city"
              label="المدينة"
              autoComplete="address-level2"
              value={m.city}
              onChange={w("city")}
              error={S.city}
            />
            <Field
              id="c-district"
              label="الحي"
              autoComplete="address-level3"
              value={m.district}
              onChange={w("district")}
              error={S.district}
            />
          </div>
          <Field
            id="c-address"
            label="الشارع ورقم المبنى"
            autoComplete="street-address"
            value={m.address}
            onChange={w("address")}
            error={S.address}
          />
          <fieldset className="border-0 p-0 m-0 mt-2">
            <legend className="m-0 mb-3 text-[22px] font-extrabold">
              طريقة الدفع
            </legend>
            <div className="grid gap-3">
              <PaymentOption
                checked={h === "cod"}
                onSelect={() => E("cod")}
                title="الدفع عند الاستلام"
                note="ادفع للمندوب نقداً أو بالبطاقة عند التوصيل"
              />
              <PaymentOption
                checked={h === "online"}
                disabled={!g}
                onSelect={() => E("online")}
                title="مدى، Apple Pay، STC Pay، تابي"
                note={
                  g
                    ? "تنتقل لصفحة الدفع الآمنة وترجع للطلب"
                    : "الدفع الإلكتروني غير مفعّل حالياً"
                }
              />
            </div>
          </fieldset>
          {Z && (
            <p
              role="alert"
              className="m-0 text-[15px] font-bold text-[#b0354f]"
            >
              {Z}
            </p>
          )}
        </form>
        <aside
          className="panel !bg-mint-soft p-6 lg:sticky lg:top-24"
          aria-label="ملخص الطلب"
        >
          <h2 className="m-0 text-[22px] font-extrabold">ملخص الطلب</h2>
          <ul className="list-none p-0 m-0 mt-4 grid gap-3">
            {c.map((J) => (
              <li
                key={`${J.id}-${J.color ?? ""}`}
                className="flex items-center gap-3"
              >
                <span
                  className="w-12 h-12 shrink-0 rounded-xl border-2 border-ink grid place-items-center"
                  style={{
                    background: J.product.tint,
                  }}
                >
                  <ProductArt product={J.product} className="w-9 h-9" />
                </span>
                <span className="flex-1 text-[15px] font-bold leading-snug">
                  {J.product.name}
                  {J.color && (
                    <span className="block font-normal text-ink-soft">
                      {"اللون: "}
                      {J.color}
                    </span>
                  )}
                  <span className="block font-normal text-ink-soft">
                    {"× "}
                    {J.qty.toLocaleString("ar-SA")}
                  </span>
                </span>
                <span className="font-bold">
                  {formatPrice(J.qty * J.product.price)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="m-0 mt-5 pt-4 border-t-2 border-dashed border-ink/30 grid grid-cols-2 gap-y-1.5 text-[16px]">
            <dt>المنتجات</dt>
            <dd className="m-0 text-left">{formatPrice(r)}</dd>
            <dt>التوصيل</dt>
            <dd className="m-0 text-left">{C ? formatPrice(C) : "مجاني"}</dd>
            <dt className="font-extrabold text-[19px] pt-2">الإجمالي</dt>
            <dd className="m-0 text-left font-extrabold text-[19px] pt-2">
              {formatPrice(r + C)}
            </dd>
          </dl>
          <button
            type="submit"
            form="checkout-form"
            className="btn btn-pink w-full mt-5"
            disabled={z}
          >
            {z ? "جاري تأكيد الطلب…" : `أكّد الطلب · ${formatPrice(r + C)}`}
          </button>
        </aside>
      </div>
    </section>
  );
}

function PaymentOption({
  checked: c,
  disabled: r,
  onSelect: o,
  title: f,
  note: g,
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-[18px] border-2 border-ink p-4 ${c ? "bg-mint" : "bg-card"} ${r ? "opacity-50" : "cursor-pointer"}`}
    >
      <input
        type="radio"
        name="payment"
        className="mt-1.5 w-5 h-5 accent-[var(--color-leaf)]"
        checked={c}
        disabled={r}
        onChange={o}
      />
      <span>
        <span className="block font-bold text-[17px]">{f}</span>
        <span className="block text-[14px] text-ink-soft">{g}</span>
      </span>
    </label>
  );
}
