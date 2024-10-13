"use client";

import { type UseFormSetValue, useForm } from "react-hook-form";
import { useState } from "react";

import SelectLocation from "@components/ui/SelectLocation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Label } from "@components/ui/label";
import Pagination from "@components/ui/Pagination";
import DataTable from "@components/ui/data-table";
import { Input } from "@components/ui/input";

import { ADMIN_ORDERS_SORT } from "~/lib/constants";
import { getOrderEquipmentOnOwners } from "~/utils/order";
import { handleAdminLocationChange } from "~/lib/utils";
import { orderColumns, equipmentsList } from "~/lib/order";
import useDebounce from "~/hooks/useDebounce";

import { type Prisma } from "@prisma/client";
import { useLocation, useLocationStoreActions } from "~/stores/location.store";
import { useAdminOrdersCurrentPage, useAdminStoreActions } from "~/stores/admin.store";
import { trpc } from "~/trpc/client";

type Order = Prisma.OrderGetPayload<{
  include: {
    customer: {
      include: { address: true };
    };
    location: true;
    book: true;
    equipments: {
      include: { books: true; equipment: true; owner: true };
    };
    earning: true;
  };
}>;

export default function ClientAdminOrdersPage() {
  const { setLocation } = useLocationStoreActions();
  const location = useLocation();
  const currentPage = useAdminOrdersCurrentPage();
  const { setOrdersCurrentPage: setCurrentPage } = useAdminStoreActions();

  const [, setOrder] = useState<Order | null>(null);

  const pageSize = 10;

  const { setValue, watch, register } = useForm<{
    sort: string;
    search: string;
  }>();

  const locations = trpc.location.getAllLocations.useQuery();

  const sort = watch("sort", ADMIN_ORDERS_SORT["NEXT ORDERS"]);
  const search = useDebounce(watch("search", ""), 500);

  const { data } = trpc.order.getOrders.useQuery({
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    location: location.id,
    sort,
    search,
  });

  const filteredOrders = data?.orders.map((order) => ({
    ...order,
    equipments: getOrderEquipmentOnOwners(order.equipments, order.bookId),
  }));

  return (
    <>
      <h1 className="text-lg font-bold">PEDIDOS</h1>
      <div className="grid grid-cols-12 gap-6 pt-6">
        <div className="col-span-12 flex flex-wrap items-center gap-2 rounded-md bg-white p-4 md:flex-nowrap md:gap-6">
          <Label className="col-span-2">Sucursal:</Label>
          {locations?.data && (
            <SelectLocation
              placeholder="elegir"
              defaultValue={`${location.id}-${location.name}`}
              onValueChange={(e) => handleAdminLocationChange(e, setLocation)}
            >
              <SelectItem value="all-all">Todos</SelectItem>
            </SelectLocation>
          )}
          <Label className="whitespace-nowrap	">Ordenar por:</Label>
          <SelectSortOrders setValue={setValue} />
          <Input type="search" placeholder="buscar por número" {...register("search")} defaultValue={undefined} />
        </div>
        <div className="col-span-12">
          {filteredOrders && (
            <DataTable
              data={filteredOrders}
              columns={orderColumns}
              setRowData={setOrder}
              expandedComponent={equipmentsList}
            />
          )}
        </div>
      </div>

      <Pagination
        totalCount={data?.totalCount ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page as number)}
      />
    </>
  );
}

type SelectSortOrdersProps = {
  setValue: UseFormSetValue<{ sort: string; search: string }>;
};

const SelectSortOrders = ({ setValue }: SelectSortOrdersProps) => {
  return (
    <Select defaultValue={ADMIN_ORDERS_SORT["NEXT ORDERS"]} onValueChange={(e) => setValue("sort", e)}>
      <SelectTrigger>
        <SelectValue placeholder="elegir" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ADMIN_ORDERS_SORT["NEXT ORDERS"]}>Próximos pedidos a entregar</SelectItem>
          <SelectItem value={ADMIN_ORDERS_SORT["LAST ORDERS"]}>Últimos pedidos</SelectItem>
          <SelectItem value={ADMIN_ORDERS_SORT.HISTORY}>Historial</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
