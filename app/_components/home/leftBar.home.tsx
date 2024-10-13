"use client";

import SelectDateButton from "@components/ui/SelectDateButton";
import SelectLocation from "@components/ui/SelectLocation";
import { useSideMenu } from "~/hooks/useSideMenu";
import { toArgentinaDate } from "~/lib/dates";
import { handleLocationChange } from "~/lib/utils";
import { FilterIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useCartStoreActions } from "~/stores/cart.store";
import { useEndDate, useStartDate } from "~/stores/date.store";
import { useLocation, useLocationStoreActions } from "~/stores/location.store";
import { trpc } from "~/trpc/client";

export const LeftBar = () => {
  const { data: categories } = trpc.category.getAllCategories.useQuery();

  const selectedCategory = useSearchParams()?.get("category") ?? "";
  const { showSideMenu, handleShowSideMenu, setShowSideMenu } = useSideMenu();

  const filtersSectionRef = useRef<HTMLElement | null>(null);

  const startDate = useStartDate();
  const endDate = useEndDate();
  const location = useLocation();
  const { emptyCart } = useCartStoreActions();
  const { setLocation } = useLocationStoreActions();

  return (
    <>
      <input
        className="peer hidden"
        id="filters"
        type="checkbox"
        checked={showSideMenu}
        onChange={handleShowSideMenu}
      />
      <label
        htmlFor="filters"
        className="col-span-3 col-start-10 flex justify-end gap-2 pb-2 peer-checked:text-secondary-foreground md:hidden"
      >
        Filtros
        <FilterIcon className="h-5 w-5" />
      </label>
      <section
        ref={filtersSectionRef}
        className="fixed left-[-110%] top-[70px] z-30  flex h-screen w-[60%] flex-col justify-start gap-6 overflow-y-auto bg-primary p-4 text-white transition-all duration-300 ease-in-out peer-checked:left-0 sm:z-0 lg:relative lg:left-0 lg:top-0 lg:col-span-3 lg:flex lg:h-[calc(100vh_-_148px)] lg:w-full lg:flex-col lg:gap-4 lg:rounded-md lg:bg-white lg:p-4 lg:text-primary lg:shadow-sm"
      >
        <SelectLocation
          placeholder="Elegir sucursal"
          defaultValue={location.id ? `${location.id}-${location.name}` : undefined}
          onValueChange={(e) => {
            handleLocationChange(e, setLocation);
            emptyCart();
          }}
        />

        <SelectDateButton />

        <div>
          <div className="flex items-center justify-between">
            <p>Retiro:</p>
            <p className="font-semibold">
              {(startDate && toArgentinaDate(startDate)) ?? <span className="text-xs text-gray-500">DD/MM/YYYYY</span>}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p>Devolución:</p>
            <p className="font-semibold">
              {(endDate && toArgentinaDate(endDate)) ?? <span className="text-xs text-gray-500">DD/MM/YYYYY</span>}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="font-bold">Categorías:</p>
          <ul className="grid">
            <li
              className={`cursor-pointer rounded-sm px-2 py-1 ${
                !selectedCategory ? "bg-secondary font-bold text-secondary-foreground" : ""
              }`}
            >
              <Link href={{ query: { category: "" } }}>Todos</Link>
            </li>
            {categories
              ?.sort((a, b) => (a.order > b.order ? 1 : -1))
              .map((category) => (
                <li
                  key={category.id}
                  className={`cursor-pointer rounded-sm px-2 py-1 ${
                    selectedCategory === category.id ? "bg-secondary font-bold text-secondary-foreground" : ""
                  }`}
                >
                  <Link href={{ query: { category: category.id } }}>{category.name}</Link>
                </li>
              ))}
          </ul>
        </div>
      </section>
      {showSideMenu && (
        <div
          onClick={() => setShowSideMenu(false)}
          className="fixed right-0 top-0 z-10 h-screen w-full bg-background/30 backdrop-blur-sm"
        />
      )}
    </>
  );
};
