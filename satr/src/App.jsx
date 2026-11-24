import { Layout } from "./components/Layout";
import { useHashRoute } from "./lib/router";
import { useStore } from "./lib/store";
import { CheckoutPage } from "./pages/Checkout";
import { HomePage } from "./pages/Home";
import { NotFoundPage } from "./pages/NotFound";
import { OrderPage } from "./pages/Order";
import { ProductPage } from "./pages/Product";
import { SchoolListPage } from "./pages/SchoolList";
import { ShopPage } from "./pages/Shop";
import { TrackPage } from "./pages/Track";
import { AdminPage } from "./pages/admin/AdminPage";

export function App() {
  const c = useHashRoute();
  const [r, o = ""] = c.split("?");
  return (
    <Layout route={r}>
      <Routes path={r} query={new URLSearchParams(o)} />
    </Layout>
  );
}

function Routes({ path: c, query: r }) {
  const { categories: o } = useStore();
  if (c === "/") {
    return <HomePage />;
  }
  if (c === "/shop") {
    const f = r.get("c");
    const g = o.some((m) => m.id === f) ? f : null;
    return <ShopPage key={g ?? "all"} initialCategory={g} />;
  }
  if (c.startsWith("/product/")) {
    return <ProductPage id={decodeURIComponent(c.slice(9))} />;
  } else if (c === "/school-list") {
    return <SchoolListPage />;
  } else if (c === "/checkout") {
    return <CheckoutPage />;
  } else if (c === "/track") {
    return <TrackPage />;
  } else if (c.startsWith("/order/")) {
    return <OrderPage number={decodeURIComponent(c.slice(7))} />;
  } else if (c === "/admin") {
    return <AdminPage />;
  } else {
    return <NotFoundPage />;
  }
}
