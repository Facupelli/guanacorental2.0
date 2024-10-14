"use client";

import { es } from "date-fns/locale";
import dayjs from "dayjs";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { useState, useEffect } from "react";

import { Calendar } from "@components/ui/calendar";
import { Button, buttonVariants } from "@components/ui/button";
import DialogWithState from "@components/DialogWithState";
import { ShoppingCart } from "lucide-react";

import { cn, formatPrice, isEquipmentAvailable } from "~/lib/utils";

import type { Equipment } from "types/models";
import { useLocation } from "~/stores/location.store";
import { useEndDate, useStartDate } from "~/stores/date.store";
import { useCartItems, useCartStoreActions } from "~/stores/cart.store";
import { useSearchParams } from "next/navigation";
import { LocationName } from "~/lib/constants";
import { trpc } from "~/trpc/client";

export default function EquipmentList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();

  const category = useSearchParams()?.get("category") ?? "";
  const search = searchParams?.get("s") ?? undefined;
  const sort = searchParams?.get("sortBy") ?? undefined;

  const location = useLocation();

  const { data, fetchNextPage, hasNextPage, isLoading } = trpc.equipment.getAllEquipment.useInfiniteQuery(
    {
      sort,
      category,
      location: location.id ?? LocationName.MENDOZA,
      search,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const handleLoadMore = async () => {
    await fetchNextPage();
  };

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const equipments = data?.pages
    .map((page) => page.equipments)
    .flat()
    .map((item) => ({
      ...item,
      owner: item.owner.filter((ownerOnEquipment) => ownerOnEquipment.locationId === location.id),
    }));

  return (
    <>
      <section className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] content-start gap-8 pb-10">
        {isLoading && <div>Cargando...</div>}
        {equipments?.length === 0 ? (
          <p>No se encontraron equipos disponibles para esta sucursal {":("}</p>
        ) : (
          equipments?.map((equipment) => <EquipmentCard key={equipment.id} equipment={equipment} />)
        )}
      </section>
      {equipments && equipments.length > 0 && hasNextPage && (
        <div className="flex justify-center py-6" ref={ref}>
          <Button onClick={handleLoadMore}>cargar más</Button>
        </div>
      )}
    </>
  );
}

type EquipmentCardProps = {
  equipment: Equipment;
};

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const { setShowCartModal } = useCartStoreActions();
  const [showCalendar, setShowCalendar] = useState(false);

  const cartItems = useCartItems();
  const { addToCart } = useCartStoreActions();
  const startDate = useStartDate();
  const endDate = useEndDate();

  const isAlreadyInCart = !!cartItems.find((item) => item.id === equipment.id);

  const handleAddToCart = (isAlreadyInCart: boolean, equipment: Equipment) => {
    if (isAlreadyInCart) return;

    addToCart(equipment);

    if (cartItems.length === 0) setShowCartModal(true);
  };

  const available = isEquipmentAvailable(equipment, { startDate, endDate });

  const isFreeDay = (date: Date) => {
    if (
      isEquipmentAvailable(equipment, {
        startDate: date,
        endDate: dayjs(date).add(1, "day").toDate(),
      })
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <DialogWithState isOpen={showCalendar} setOpen={setShowCalendar} title="">
        <Calendar
          locale={es}
          fixedWeeks
          initialFocus
          classNames={{
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "w-10 h-10 md:h-12 md:w-16 p-0 font-normal aria-selected:opacity-100 hover:bg-secondary rounded-none"
            ),
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground ",
          }}
          modifiers={{
            freeDay: isFreeDay,
            bookedDay: (date: Date) => !isFreeDay(date),
          }}
          modifiersClassNames={{
            freeDay: "free-day",
            bookedDay: "booked-day",
          }}
        />
      </DialogWithState>

      <article className="grid gap-2 rounded-sm bg-white p-4 shadow-sm">
        {equipment.image && (
          <div className="relative h-[200px] w-[200px]">
            <Image
              src={equipment.image}
              alt={`${equipment.name} ${equipment.brand} equipment picture`}
              fill
              className="w-fill h-full object-contain"
              sizes="(max-width: 468px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 33vw"
              priority={equipment.model === "FX3 Cinema Line 4K 120 FPS"}
            />
          </div>
        )}

        <div>
          <p className="font-bold">
            {equipment.name} {equipment.brand}
          </p>
          <p>{equipment.model}</p>
        </div>

        <div className="flex items-center justify-end text-sm">
          <p className={`${available ? "text-green-500" : "text-red-500"}`}>{available ? "Disponible" : "Reservado"}</p>
          <Button size="sm" variant="darklink" className="text-xs" onClick={() => setShowCalendar(true)}>
            ver más
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{formatPrice(equipment.price)}</p>
          <Button
            size="sm"
            variant="secondary"
            className="font-bold"
            onClick={() => handleAddToCart(isAlreadyInCart, equipment)}
            aria-label="add-to-cart-button"
            disabled={!available}
          >
            {isAlreadyInCart ? "Agregado" : <ShoppingCart className="h-5 w-5" />}
          </Button>
        </div>
      </article>
    </>
  );
};
