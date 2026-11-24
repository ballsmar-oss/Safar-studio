import { SleepingCat } from "./Cat";

export function CatalogState({ catalog: c }) {
  if (c.status === "loading") {
    return (
      <section className="wrap py-20 text-center" aria-live="polite">
        <p className="lead m-0">جاري تحميل المنتجات…</p>
      </section>
    );
  } else {
    return <CatalogError message={c.status === "error" ? c.message : ""} />;
  }
}

function CatalogError({ message: c }) {
  return (
    <section className="wrap py-16 text-center">
      <SleepingCat className="w-28 mx-auto" />
      <h1 className="text-[26px] font-extrabold mt-4 mb-1">
        ما قدرنا نحمّل المتجر
      </h1>
      <p className="lead m-0">{c}</p>
      <button className="btn mt-6" onClick={() => window.location.reload()}>
        جرّب مرة ثانية
      </button>
    </section>
  );
}
