import Nav from "app/_components/nav";
import ItemsList from "app/_components/cart/itemList.cart";
import RightBar from "app/_components/cart/rightBar.cart";

export default function CartPage() {
  return (
    <>
      <Nav />

      <main className="min-h-screen bg-app-bg px-4 pt-[70px] sm:px-6">
        <div className="mx-auto max-w-7xl py-8 sm:pt-12">
          <section className="grid grid-cols-12 gap-y-12 sm:gap-x-8 sm:gap-y-0">
            <section className="col-span-12 sm:col-span-8">
              <div className="hidden grid-cols-12 pb-6 text-primary/60 sm:grid">
                <p className="col-span-7">Equipos</p>
                <p className="col-span-2">Cantidad</p>
                <p className="col-span-2">Precio</p>
              </div>
              <ItemsList />
            </section>
            <RightBar />
          </section>
        </div>
      </main>
    </>
  );
}
