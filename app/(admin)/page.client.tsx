"use client";

import { es } from "date-fns/locale";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import { Calendar } from "@/components/ui/calendar";
import { useCallback, useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import SelectLocation from "@/components/ui/SelectLocation";
import { SelectItem } from "@/components/ui/select";
import DataTable from "@/components/ui/data-table";

import { cn, getIsAdmin, handleAdminLocationChange } from "@/lib/utils";
import { getOrderEquipmentOnOwners } from "@/server/utils/order";
import { equipmentsList, orderColumns } from "@/lib/order";

import { type Prisma } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { useAdminCalendarDay, useAdminStoreActions } from "stores/admin.store";
import { useLocation, useLocationStoreActions } from "stores/location.store";
import { trpc } from "trpc/client";

type Order = Prisma.OrderGetPayload<{
  include: {
    book: true;
    equipments: {
      include: { books: true; owner: true; equipment: true };
    };
    customer: {
      include: {
        address: true;
      };
    };
    location: true;
    earning: true;
  };
}>;

export default function ClientAdminPage() {
  const { data: session } = useSession();

  const [, setOrder] = useState<Order | null>(null);

  const calendarDay = useAdminCalendarDay();
  const { setCalendarDay } = useAdminStoreActions();
  const { setLocation } = useLocationStoreActions();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[] | null>(null);

  const locations = trpc.location.getAllLocations.useQuery();
  const { data } = trpc.order.getCalendarOrders.useQuery({
    location: location.id,
  });

  const handleClickDay = useCallback(
    (day: Date) => {
      if (data) {
        setCalendarDay(day);

        const orders = data.filter(
          (order) =>
            dayjs(order.book.start_date).isSame(dayjs(day), "day") ||
            dayjs(order.book.end_date).isSame(dayjs(day), "day")
        );

        const filteredOrders = orders.map((order) => ({
          ...order,
          equipments: getOrderEquipmentOnOwners(order.equipments, order.bookId),
        }));

        setOrders(filteredOrders);
      }
    },
    [data, setCalendarDay]
  );

  useEffect(() => {
    handleClickDay(calendarDay);
  }, [data, handleClickDay, calendarDay]);

  const isAdmin = getIsAdmin(session);

  const calendarMinDate = isAdmin
    ? dayjs().subtract(1, "month").startOf("day").toDate()
    : dayjs().startOf("day").toDate();

  const isPickupDay = (date: Date) => {
    const localDate = dayjs(date);
    if (data?.find((order) => dayjs(order.book.start_date).isSame(localDate, "day"))) {
      return true;
    }
    return false;
  };

  const isReturnDay = (date: Date) => {
    const localDate = dayjs(date);

    if (data?.find((order) => dayjs(order.book.end_date).isSame(dayjs(localDate), "day"))) {
      return true;
    }
    return false;
  };

  const isPickupAndReturnDay = (date: Date) => {
    if (
      data?.find(
        (order) =>
          dayjs(order.book.end_date).isSame(dayjs(date), "day") &&
          data.find((order) => dayjs(order.book.start_date).isSame(dayjs(date), "day"))
      )
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <h1 className="text-lg font-bold">CALENDARIO</h1>
      <div className="grid grid-cols-12 gap-6 pt-6">
        <div className="col-span-12 flex items-center gap-2 rounded-md bg-white p-4 md:w-2/3 lg:w-1/3">
          <Label>Sucursal:</Label>
          {locations?.data && (
            <SelectLocation
              placeholder="elegir"
              defaultValue={`${location.id}-${location.name}`}
              onValueChange={(e) => handleAdminLocationChange(e, setLocation)}
            >
              <SelectItem value="all-all">Todos</SelectItem>
            </SelectLocation>
          )}
        </div>
        <div className="col-span-12 flex max-w-[750px] gap-6 ">
          <Calendar
            mode="single"
            locale={es}
            selected={calendarDay}
            onSelect={(date) => {
              if (date) {
                setCalendarDay(date);
              }
            }}
            fixedWeeks
            initialFocus
            className="rounded-md bg-white"
            classNames={{
              day: cn(
                buttonVariants({ variant: "ghost" }),
                "w-10 h-10 md:h-12 md:w-16 p-0 font-normal aria-selected:opacity-100 hover:bg-secondary rounded-none"
              ),
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground ",
            }}
            modifiers={{
              disabled: [
                {
                  before: calendarMinDate,
                },
              ],
              pickAndReturn: isPickupAndReturnDay,
              pickup: isPickupDay,
              return: isReturnDay,
            }}
            modifiersClassNames={{
              pickAndReturn: "pickup-and-return",
              pickup: "pickup-day",
              return: "return-day",
            }}
          />

          <div className="hidden flex-col gap-2 rounded-md bg-white/50 p-4 text-sm font-semibold sm:flex">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-400" />
              <p>Retiro de equipos</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-400" />
              <p>Devolución de equipos</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="r h-4 w-2 rounded-bl-full rounded-tl-full bg-green-400" />
                <div className="r h-4 w-2 rounded-br-full rounded-tr-full bg-red-400" />
              </div>
              <p>Devolución y Retiro de equipos</p>
            </div>
            <div className="py-4 text-primary/60">
              Selecciona una fecha para ver los pedidos que se retiran o devuelven ese mismo día.
            </div>
          </div>
        </div>
        <div className="col-span-12">
          {orders && (
            <DataTable data={orders} columns={orderColumns} setRowData={setOrder} expandedComponent={equipmentsList} />
          )}
        </div>
      </div>
    </>
  );
}
