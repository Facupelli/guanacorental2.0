import ShowLocationDialog from "./_components/dialog/showLocationDialog";
import { LeftBar } from "./_components/home/leftBar.home";
import Filters from "./_components/home/filters.home";
import SelectOrder from "./_components/home/selectOrder.home";
import EquipmentList from "./_components/home/equipmentList.home";
import { Suspense } from "react";
import Cart from "./_components/Cart";

export default function HomePage() {
  return (
    <>
      <ShowLocationDialog />
      <Cart />

      <main className="min-h-screen bg-app-bg px-4 pt-[70px] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <section className="mt-6 grid grid-cols-12 gap-x-6 gap-y-2 lg:mt-12">
            <Suspense>
              <LeftBar />
            </Suspense>
            <div className="col-span-12 flex flex-col gap-4 lg:col-span-9">
              <section className="grid gap-4 rounded-sm bg-white p-4 shadow-sm lg:flex">
                <Suspense>
                  <Filters />
                  <SelectOrder />
                </Suspense>
              </section>
              <Suspense>
                <EquipmentList />
              </Suspense>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
