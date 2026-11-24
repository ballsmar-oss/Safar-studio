import { SleepingCat } from "../components/Cat";

export function NotFoundPage() {
  return (
    <section className="wrap py-16 text-center">
      <SleepingCat className="w-32 mx-auto" />
      <h1 className="text-[30px] font-extrabold mt-4 mb-1">
        الصفحة هذي مو موجودة
      </h1>
      <p className="lead m-0">يمكن الرابط قديم. ارجع للمتجر وكمّل تسوّقك.</p>
      <a href="#/shop" className="btn mt-6">
        روح للمتجر
      </a>
    </section>
  );
}
