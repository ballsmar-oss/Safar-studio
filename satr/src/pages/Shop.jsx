import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { SleepingCat } from "../components/Cat";
import { CatalogState } from "../components/CatalogState";
import { Squiggle } from "../components/Decor";
import { ProductCard } from "../components/ProductCard";
import { useStore } from "../lib/store";

export function ShopPage({ initialCategory: c }) {
  const { products: r, categories: o, catalog: f } = useStore();
  if (f.status !== "ready") {
    return <CatalogState catalog={f} />;
  }
  const [g, m] = useState(c);
  const [b, S] = useState("");
  const [y, h] = useState("new");
  const E = useMemo(() => {
    const Q = b.trim();
    const Z = r.filter(
      (O) => (!g || O.category === g) && (!Q || O.name.includes(Q)),
    );
    if (y === "low") {
      Z.sort((O, C) => O.price - C.price);
    }
    if (y === "high") {
      Z.sort((O, C) => C.price - O.price);
    }
    return Z;
  }, [g, b, y]);
  const z = () => {
    m(null);
    S("");
  };
  return (
    <section className="wrap pt-10">
      <div className="text-center">
        <h1 className="section-title !text-[36px]">المتجر</h1>
        <Squiggle />
        <p className="lead mt-2 mb-0">كل أدوات المدرسة والمكتب في مكان واحد.</p>
      </div>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="-mx-[18px] px-[18px] pb-2 overflow-x-auto lg:mx-0 lg:px-0 lg:pb-0"
          role="group"
          aria-label="الأقسام"
        >
          <div className="flex gap-2.5 w-max">
            <button
              className="chip"
              aria-pressed={g === null}
              onClick={() => m(null)}
            >
              الكل
            </button>
            {o.map((Q) => (
              <button
                key={Q.id}
                className="chip"
                aria-pressed={g === Q.id}
                onClick={() => m(Q.id)}
              >
                {Q.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <label className="relative flex-1 lg:w-72">
            <span className="sr-only">ابحث في المتجر</span>
            <Search
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
            <input
              className="field !pr-11"
              type="search"
              placeholder="ابحث: دفتر، مسطرة…"
              value={b}
              onChange={(Q) => S(Q.target.value)}
            />
          </label>
          <label className="relative shrink-0">
            <span className="sr-only">رتّب حسب</span>
            <select
              className="field !w-auto appearance-none !pl-10"
              value={y}
              onChange={(Q) => h(Q.target.value)}
            >
              <option value="new">الأحدث</option>
              <option value="low">الأرخص</option>
              <option value="high">الأغلى</option>
            </select>
            <ChevronDown
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </label>
        </div>
      </div>
      <p className="mt-6 mb-4 text-ink-soft text-[15px]" aria-live="polite">
        {E.length.toLocaleString("ar-SA")}
        {" منتج"}
      </p>
      {E.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {E.map((Q) => (
            <ProductCard key={Q.id} product={Q} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <SleepingCat className="w-32 mx-auto" />
          <p className="text-[22px] font-extrabold mt-4 mb-1">
            ما لقينا «{b}» في هذا القسم
          </p>
          <p className="lead m-0">جرّب كلمة ثانية أو شوف كل الأقسام.</p>
          <button className="btn btn-pink mt-6" onClick={z}>
            اعرض كل المنتجات
          </button>
        </div>
      )}
    </section>
  );
}
