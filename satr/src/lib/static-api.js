import { ApiError } from "./api";
import { CATEGORIES, SEED_PRODUCTS } from "../../shared/catalog";

const PRODUCTS_KEY = "satr-preview-products";

const ORDERS_KEY = "satr-preview-orders";

const LISTS_KEY = "satr-preview-lists";

const PREVIEW_SHIPPING_FEE = 25;

const PREVIEW_FREE_MIN = 150;

const readJson = (c, r) => {
  try {
    return JSON.parse(localStorage.getItem(c) ?? "null") ?? r;
  } catch {
    return r;
  }
};

const writeJson = (c, r) => {
  try {
    localStorage.setItem(c, JSON.stringify(r));
  } catch {}
};

const normalizePhone = (c) => c.replace(/\D/g, "").replace(/^966/, "0");

const bodyOf = (c) => c.json ?? {};

function getProducts() {
  const c = readJson(PRODUCTS_KEY, null);
  if (c) {
    return c;
  }
  const r = SEED_PRODUCTS.map((o) => ({
    ...o,
    stock: 25,
    active: true,
  }));
  writeJson(PRODUCTS_KEY, r);
  return r;
}

const saveProducts = (c) => writeJson(PRODUCTS_KEY, c);

const getOrders = () => readJson(ORDERS_KEY, []);

const saveOrders = (c) => writeJson(ORDERS_KEY, c);

const getLists = () => readJson(LISTS_KEY, []);

export function staticApi(c, r) {
  const o = (r.method ?? "GET").toUpperCase();
  const g = new URL(c, "http://preview.local").pathname;
  function m(S, y) {
    throw new ApiError(S, y);
  }
  const b = () => {
    if (!r.token) {
      m(401, "التوكن غلط");
    }
  };
  if (o === "GET" && g === "/api/catalog") {
    return {
      categories: CATEGORIES,
      products: getProducts().filter((S) => S.active !== false),
      onlinePayment: false,
      shipping: { fee: PREVIEW_SHIPPING_FEE, freeMin: PREVIEW_FREE_MIN },
    };
  }
  if (o === "GET" && g.startsWith("/api/products/")) {
    const S = decodeURIComponent(g.slice(14));
    return (
      getProducts().find((h) => h.id === S && h.active !== false) ??
      m(404, "المنتج غير موجود")
    );
  }
  if (o === "POST" && g === "/api/orders") {
    const S = bodyOf(r);
    if (!S.items?.length) {
      m(400, "السلة فاضية");
    }
    if (S.payment !== "cod") {
      m(400, "الدفع الإلكتروني غير متاح في المعاينة، اختر الدفع عند الاستلام.");
    }
    const y = getProducts();
    const h = S.items.map((w) => {
      const Y = y.find((et) => et.id === w.id && et.active !== false);
      if (!Y) {
        m(400, `المنتج ${w.id} ما عاد متوفر.`);
      }
      const J = Y.colors ?? [];
      if (J.length && (!w.color || !J.includes(w.color))) {
        m(400, `اختر لون «${Y.name}».`);
      }
      if (!J.length && w.color) {
        m(400, `«${Y.name}» ما له ألوان.`);
      }
      if (Y.stock < w.qty) {
        m(409, `الكمية المطلوبة من «${Y.name}» أكثر من المتوفر (${Y.stock}).`);
      }
      return {
        id: Y.id,
        name: Y.name,
        price: Y.price,
        qty: w.qty,
        color: w.color,
      };
    });
    for (const w of h) {
      const Y = y.find((J) => J.id === w.id);
      Y.stock -= w.qty;
    }
    saveProducts(y);
    const E = h.reduce((w, Y) => w + Y.price * Y.qty, 0);
    const z = E >= PREVIEW_FREE_MIN ? 0 : PREVIEW_SHIPPING_FEE;
    const Q = new Date();
    const Z = `SA-${String(Q.getFullYear()).slice(2)}${String(Q.getMonth() + 1).padStart(2, "0")}${String(Q.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 8999)}`;
    const O = getOrders();
    const C = {
      id: (O.at(-1)?.id ?? 0) + 1,
      number: Z,
      status: "new",
      paymentMethod: "cod",
      paymentStatus: "cod",
      customer: {
        ...S.customer,
        phone: normalizePhone(S.customer.phone),
      },
      total: E + z,
      subtotal: E,
      shipping: z,
      createdAt: Q.toISOString(),
      items: h,
    };
    saveOrders([...O, C]);
    return {
      number: Z,
      total: C.total,
      paymentUrl: null,
    };
  }
  if (o === "GET" && g.startsWith("/api/orders/") && !g.endsWith("/track")) {
    const S = decodeURIComponent(g.slice(12)).toUpperCase();
    const y = getOrders().find((h) => h.number === S);
    if (!y) {
      m(404, "ما لقينا طلب بهذا الرقم");
    }
    return {
      number: y.number,
      status: y.status,
      paymentStatus: y.paymentStatus,
      paymentMethod: y.paymentMethod,
      total: y.total,
      createdAt: y.createdAt,
    };
  }
  if (o === "POST" && g === "/api/orders/track") {
    const S = bodyOf(r);
    const y = getOrders().find(
      (h) => h.number === S.number.trim().toUpperCase(),
    );
    if (!y || y.customer.phone !== normalizePhone(S.phone)) {
      m(404, "ما لقينا طلب بهذا الرقم والجوال");
    }
    return {
      number: y.number,
      status: y.status,
      paymentMethod: y.paymentMethod,
      paymentStatus: y.paymentStatus,
      total: y.total,
      subtotal: y.subtotal,
      shipping: y.shipping,
      createdAt: y.createdAt,
      city: y.customer.city,
      items: y.items,
    };
  }
  if (o === "POST" && g === "/api/school-lists") {
    const S = bodyOf(r);
    const y = getLists();
    const h = (y.at(-1)?.id ?? 0) + 1;
    saveLists([
      ...y,
      {
        id: h,
        name: S.name,
        phone: normalizePhone(S.phone),
        stage: S.stage,
        text: S.text,
        file: null,
        createdAt: new Date().toISOString(),
      },
    ]);
    return {
      id: h,
    };
  }
  if (g.startsWith("/api/admin")) {
    b();
    if (o === "GET" && g === "/api/admin/status") {
      return {
        onlinePayment: false,
      };
    }
    if (o === "GET" && g === "/api/admin/products") {
      return {
        categories: CATEGORIES,
        products: getProducts(),
      };
    }
    if (o === "POST" && g === "/api/admin/products") {
      const h = bodyOf(r);
      const E = getProducts();
      const z = String(h.id ?? "");
      if (E.some((Z) => Z.id === z)) {
        m(409, "فيه منتج بنفس المعرّف");
      }
      const Q = toProduct(h, {
        stock: Number(h.stock ?? 0),
        active: true,
      });
      saveProducts([...E, Q]);
      return Q;
    }
    const S = /^\/api\/admin\/products\/([^/]+)(\/active|\/image)?$/.exec(g);
    if (S) {
      const h = decodeURIComponent(S[1]);
      const E = S[2];
      const z = getProducts();
      const Q = z.findIndex((O) => O.id === h);
      if (Q < 0) {
        m(404, "المنتج غير موجود");
      }
      const Z = z[Q];
      if (o === "PUT" && !E) {
        const O = toProduct(
          {
            ...bodyOf(r),
            id: h,
          },
          {
            stock: Number(bodyOf(r).stock ?? Z.stock),
            active: Z.active,
            image: Z.image,
          },
        );
        z[Q] = O;
        saveProducts(z);
        return O;
      }
      if (o === "POST" && E === "/active") {
        z[Q] = {
          ...Z,
          active: !!bodyOf(r).active,
        };
        saveProducts(z);
        return z[Q];
      }
      if (o === "POST" && E === "/image") {
        const O = String(bodyOf(r).file ?? "");
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(O)) {
          m(400, "الصورة لازم تكون JPG أو PNG أو WebP");
        }
        z[Q] = {
          ...Z,
          image: O,
        };
        saveProducts(z);
        return z[Q];
      }
    }
    if (o === "GET" && g === "/api/admin/orders") {
      return getOrders()
        .slice()
        .reverse()
        .map((h) => ({
          id: h.id,
          number: h.number,
          status: h.status,
          paymentMethod: h.paymentMethod,
          paymentStatus: h.paymentStatus,
          customer: h.customer,
          total: h.total,
          createdAt: h.createdAt,
          items: h.items,
          carrier: h.carrier,
          trackingNumber: h.trackingNumber,
        }));
    }
    const y = /^\/api\/admin\/orders\/(\d+)(\/mark-paid)?$/.exec(g);
    if (y) {
      const h = Number(y[1]);
      const E = getOrders();
      const z = E.findIndex((Q) => Q.id === h);
      if (z < 0) {
        m(404, "الطلب غير موجود");
      }
      if (o === "PATCH" && bodyOf(r).status === undefined) {
        const { carrier: Cr, trackingNumber: Tn } = bodyOf(r);
        E[z] = { ...E[z], carrier: Cr || undefined, trackingNumber: Tn || undefined };
      } else if (o === "PATCH") {
        const Q = bodyOf(r).status;
        if (
          !["new", "preparing", "shipped", "delivered", "cancelled"].includes(
            Q ?? "",
          )
        ) {
          m(400, "حالة غير صحيحة");
        }
        E[z] = {
          ...E[z],
          status: Q,
        };
      }
      if (o === "POST" && y[2]) {
        E[z] = {
          ...E[z],
          paymentStatus: "paid",
        };
      }
      saveOrders(E);
      return {
        ok: true,
      };
    }
    if (o === "GET" && g === "/api/admin/school-lists") {
      return getLists().slice().reverse();
    }
    if (o === "GET" && g === "/api/admin/carriers") {
      return ["سمسا", "أرامكس", "سبل (البريد السعودي)"];
    }
    if (g.startsWith("/api/admin/integrations") || g.startsWith("/api/admin/settings")) {
      m(501, "التكاملات والإعدادات تشتغل مع السيرفر فقط. شغّل المشروع بـ npm run dev.");
    }
    m(404, "المسار غير موجود");
  }
  return m(404, "المسار غير موجود");
}

function saveLists(c) {
  writeJson(LISTS_KEY, c);
}

function toProduct(c, r) {
  const o = Array.isArray(c.details) ? c.details.filter(Boolean) : [];
  const f = Array.isArray(c.colors) ? c.colors.filter(Boolean) : [];
  return {
    id: String(c.id),
    name: String(c.name ?? ""),
    category: c.category,
    price: Number(c.price ?? 0),
    oldPrice: c.oldPrice ? Number(c.oldPrice) : undefined,
    art: c.art ?? "notebook",
    tint: String(c.tint ?? "var(--color-mint)"),
    badge: c.badge || undefined,
    description: String(c.description ?? ""),
    details: o,
    stock: r.stock,
    active: r.active ?? true,
    brand: c.brand || undefined,
    madeIn: c.madeIn || undefined,
    colors: f,
    image: r.image,
  };
}
