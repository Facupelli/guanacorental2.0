import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DialogWithState from "@/components/DialogWithState";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";

import {
  ORDER_DELIVER_STATUS,
  ORDER_RETURN_STATUS,
  orderReturnedClass,
  orderStatusClass,
} from "./constants";

import { type Columns } from "@/types/table";
import { type Prisma } from "@prisma/client";
import { useState, type MouseEvent } from "react";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { toArgentinaDate } from "./dates";

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

type CellProps = unknown;

const getIsToday = (date: Date) => {
  const today = dayjs().startOf("day");
  const providedDate = dayjs(date).startOf("day");
  return today.isSame(providedDate);
};

export const orderColumns: Columns<Order, CellProps>[] = [
  { title: "N°", cell: (rowData) => <div>{rowData.number}</div> },
  { title: "Nombre", cell: (rowData) => <div>{rowData.customer.name}</div> },
  {
    title: "Teléfono",
    cell: (rowData) => <div>{rowData.customer.address?.phone}</div>,
  },
  {
    title: "Retiro",
    cell: (rowData) => {
      const isToday = getIsToday(rowData.book.start_date);
      const statusValue: string = rowData.deliver_status;

      return (
        <div className={`flex items-center gap-2`}>
          <p className={isToday ? "font-bold" : ""}>
            {isToday ? "HOY" : toArgentinaDate(rowData.book.start_date)}{" "}
            <span className="text-xs">{rowData.book.pickup_hour}hs</span>
          </p>
          <span className={orderStatusClass[statusValue]}>{statusValue}</span>
        </div>
      );
    },
  },
  {
    title: "Devolución",
    cell: (rowData) => {
      const isToday = getIsToday(rowData.book.end_date);
      const statusValue: string = rowData.return_status;

      return (
        <div className={`flex items-center gap-2`}>
          <p className={isToday ? "font-bold" : ""}>
            {isToday ? "HOY" : toArgentinaDate(rowData.book.end_date)}
          </p>
          <span className={orderReturnedClass[statusValue]}>{statusValue}</span>
        </div>
      );
    },
  },
  {
    title: "Sucursal",
    cell: (rowData) => <div>{rowData.location.name}</div>,
  },
  {
    title: "",
    cell: (rowData, cellData) => {
      const handleClickExpand = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        cellData.cellFunctions.toggleRowExpansion();
      };

      return (
        <div>
          {cellData.cellFunctions.isRowExpanded ? (
            <button
              className="rounded-full p-2 hover:bg-primary-foreground"
              onClick={handleClickExpand}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          ) : (
            <button
              className="rounded-full p-2 hover:bg-primary-foreground"
              onClick={handleClickExpand}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  },
  {
    title: "",
    cell: (rowData) => <OrderActionsDropMenu order={rowData} />,
  },
];

export const equipmentsList = ({ rowData }: { rowData: Order }) => {
  return (
    <div className="grid gap-4">
      {rowData.equipments.map((ownerEquipment) => (
        <div key={ownerEquipment.id} className="flex items-center gap-4">
          {ownerEquipment.equipment.image && (
            <div className="relative h-10 w-10 rounded-full bg-white">
              <Image
                src={ownerEquipment.equipment.image}
                alt="equipment picture"
                fill
                style={{ borderRadius: "100%" }}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className="font-semibold">{ownerEquipment.equipment.name}</p>
            <p className="font-semibold">{ownerEquipment.equipment.brand}</p>
            <p>{ownerEquipment.equipment.model}</p>
            <p className="text-xs text-primary/60">
              {ownerEquipment.owner.name}
            </p>
          </div>
          <div>
            <p>
              x
              {ownerEquipment.books.reduce((acc, curr) => {
                return acc + curr.quantity;
              }, 0)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const DynamicButton = dynamic<{ order: Order }>(() =>
  import("../components/remito/DownloadRemitoButton").then(
    (mod) => mod.DownloadRemitoButton
  )
);

const OrderActionsDropMenu = ({ order }: { order: Order }) => {
  const { register, handleSubmit } = useForm<{ file: FileList }>();

  const ctx = api.useContext();
  const { mutate } = api.order.setOrderDelivered.useMutation();
  const setOrderReturned = api.order.setOrderReturned.useMutation();

  const [isLoading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: { file: FileList }) => {
    setError("");
    setLoading(true);

    if (!data.file[0] || !order.customer.email) {
      setError("Debes adjuntar el remito con el contrato");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("pdf", data.file[0]);
    formData.append("email", order.customer.email);
    formData.append("orderNumber", String(order.number));

    const response = await fetch("/api/send-email", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      mutate(
        { orderId: order.id },
        {
          onSuccess: () => {
            setShowModal(false);
            void ctx.order.getCalendarOrders.invalidate();
            void ctx.order.getOrders.invalidate();
            setLoading(false);
          },
        }
      );
    } else {
      setError("Failed to send email");
      setLoading(false);
    }
  };

  const handleReturnOrder = (orderId: string) => {
    setOrderReturned.mutate(
      { orderId },
      {
        onSuccess: () => {
          void ctx.order.getCalendarOrders.invalidate();
          void ctx.order.getOrders.invalidate();
        },
      }
    );
  };

  return (
    <>
      <DialogWithState
        isOpen={showModal}
        setOpen={setShowModal}
        title="Adjuntar remito"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <Input type="file" {...register("file")} />
          <Button size="sm" type="submit">
            {isLoading ? "Cargando.." : "Enviar correo"}
          </Button>
        </form>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </DialogWithState>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem>
            <Link href={`/admin/orders/${order.id}`}>Ver detalle</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DynamicButton order={order} />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowModal(true)}
            className="flex cursor-pointer gap-2"
          >
            <div className="m-0 p-0 ">
              <Input
                type="checkbox"
                id="delivered"
                className="h-4"
                defaultChecked={
                  order.deliver_status === ORDER_DELIVER_STATUS.DELIVERED
                }
              />
            </div>
            <Label className="cursor-pointer font-normal" htmlFor="delivered">
              Marcar retirado
            </Label>
          </DropdownMenuItem>
          <DropdownMenuItem
            // onClick={() => setShowModal(true)}
            onClick={() => handleReturnOrder(order.id)}
            className="flex cursor-pointer gap-2"
          >
            <div className="m-0 p-0 ">
              <Input
                type="checkbox"
                id="returned"
                className="h-4"
                defaultChecked={
                  order.return_status === ORDER_RETURN_STATUS.RETURNED
                }
              />
            </div>
            <Label className="cursor-pointer font-normal" htmlFor="returned">
              Marcar devolución
            </Label>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
