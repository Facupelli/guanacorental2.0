"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import MostBookedEquipments from "@/components/stats/MostBookedEquipments";
import OrdersByMonth from "@/components/stats/OrdersByMonth";
import OrdersByCategory from "@/components/stats/OrdersByCategory";
import { AdminSelectLocation } from "@/components/ui/SelectLocation";
import { useForm } from "react-hook-form";
import type { Category, Location } from "@/types/models";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectCategory } from "@/components/ui/SelectCategory";
import { type TopBookedEquipment } from "trpc/routers/stats";
import { trpc } from "trpc/client";
import { formatPrice } from "@/lib/utils";
import { type Metadata } from "next";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type Order = {
  categories: string[];
  total: number;
};

type StatsPageProps = {
  locations: Location[];
  categories: Category[];
  monthAverage: {
    ordersByMonth: { [key: number]: number };
    sjOrdersByMonth: { [key: number]: number };
    slOrdersByMonth: { [key: number]: number };
    avg: string;
  };
  average: { subtotalAverage: number };
};

export const metadata: Metadata = {
  title: "Guanaco | Estadísticas",
};

export default function ClientAdminStatsPage({ locations, categories, average, monthAverage }: StatsPageProps) {
  const { setValue, watch } = useForm<{
    location: string;
    category: string;
    take: number;
  }>();

  const locationId = watch("location");
  const categoryId = watch("category");
  const take = watch("take", 10);

  const { data: topBookedEquipments, isLoading: isLoadingTopBookedEquipments } =
    trpc.stats.getTopBookedEquipments.useQuery({
      category: categoryId,
      take,
    });

  // const { data: bookedEquipments, isLoading: isLoadingBookedEquipments } =
  //   trpc.stats.getEquipmentBookedStat.useQuery({
  //     equipmentId: "cl9h2fv1h0013eoqazquz1j8u",
  //   });

  const { data: topCategoryOrders, isLoading: isLoadingCategoryOrders } = trpc.stats.getTopCategoryOrders.useQuery({
    location: locationId,
  });

  return (
    <>
      <h1 className="text-lg font-bold">Estadísticas</h1>

      <div className="flex flex-col gap-6 pt-6">
        <div>
          <p>Promedio precio alquileres: {formatPrice(average.subtotalAverage)}</p>
          <p>Promedio alquileres mensuales: {monthAverage.avg}</p>
        </div>

        <OrdersByMonth ordersByMonth={monthAverage} />

        <div className="my-8 flex w-full items-center gap-2 rounded-md bg-white p-4">
          <div className="flex-1 ">
            <Label>Categoría</Label>
            <SelectCategory categories={categories} setValue={(e) => setValue("category", e)} />
          </div>

          <div className="flex-1 ">
            <Label>Cantidad de equipos</Label>
            <Select onValueChange={(e) => setValue("take", Number(e))} defaultValue="10">
              <SelectTrigger>
                <SelectValue placeholder="elegir" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cantidad</SelectLabel>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="0">Todos</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 ">
            <Label>Sucursal</Label>
            <AdminSelectLocation locations={locations} setValue={(e) => setValue("location", e)}>
              <SelectItem value="all">Todas</SelectItem>
            </AdminSelectLocation>
          </div>
        </div>

        {!isLoadingTopBookedEquipments && (
          <div className={`${take === 0 ? "h-[4500px]" : "h-[600px]"}`}>
            <MostBookedEquipments equipments={topBookedEquipments as TopBookedEquipment[]} />

            {/* NO SE UTILIZARÁ DE MOMENTO */}
            {/* <MostBookedEquipmentsByDay
                  equipments={topBookedEquipments as TopBookedEquipment[]}
                /> */}
          </div>
        )}

        {/* NO SE UTILIZARÁ DE MOMENTO */}
        {/* {!isLoadingBookedEquipments && (
              <BookedEquipment
                equipments={bookedEquipments as BookedEquipmentType[]}
              />
            )} */}

        {!isLoadingCategoryOrders && (
          <div className="mx-auto mt-8 size-[600px] max-w-[600px]">
            <OrdersByCategory orders={topCategoryOrders as Order[]} />
          </div>
        )}
      </div>
    </>
  );
}
