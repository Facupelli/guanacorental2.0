import { serverTrpc } from "utils/serverTrpc";
import type { Category, Location } from "@/types/models";
import ShowLocationDialog from "./_components/dialog/showLocationDialog";
import Cart from "@/components/Cart";
import Nav from "./_components/nav";
import { LeftBar } from "./_components/home/leftBar.home";
import Filters from "./_components/home/filters.home";
import SelectOrder from "./_components/home/selectOrder.home";
import EquipmentList from "./_components/home/equipmentList.home";
import { Suspense } from "react";

export default async function HomePage() {
  const locations: Location[] = await serverTrpc.location.getAllLocations.query();
  const categories: Category[] = await serverTrpc.category.getAllCategories.query();

  // TODO: save the default location in db, user preferences, so we can fetch the equipments in the server

  return (
    <>
      <ShowLocationDialog locations={locations} />
      <Nav />
      <Cart />

      <main className="min-h-screen bg-app-bg px-4 pt-[70px] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <section className="mt-6 grid grid-cols-12 gap-x-6 gap-y-2 lg:mt-12">
            <Suspense>
              <LeftBar locations={locations} categories={categories} />
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
