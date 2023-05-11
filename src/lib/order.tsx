import { Prisma } from "@prisma/client";
import { ReactElement } from "react";
import { orderStatusClass } from "./magic_strings";
import ActionsDropMenu from "@/components/order/ActionDropMenu";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    earnings: true;
  };
}>;

type CellFunctions<T> = {
  isRowExpanded: boolean;
  toggleRowExpansion: () => void;
};

type CellProps<T> = {} & CellFunctions<T>;

type Columns = {
  title: string;
  cell: (rowData: Order, cellProps?: CellProps<Order>) => ReactElement;
};

export const orderColumns: Columns[] = [
  { title: "N°", cell: (rowData) => <div>{rowData.number}</div> },
  { title: "Nombre", cell: (rowData) => <div>{rowData.customer.name}</div> },
  {
    title: "Teléfono",
    cell: (rowData) => <div>{rowData.customer.address?.phone}</div>,
  },
  {
    title: "Retiro",
    cell: (rowData) => (
      <div>{rowData.book.start_date.toLocaleDateString()}</div>
    ),
  },
  {
    title: "Devolución",
    cell: (rowData) => <div>{rowData.book.end_date.toLocaleDateString()}</div>,
  },
  {
    title: "Estado",
    cell: (rowData) => {
      const statusValue: string = rowData.status;
      return (
        <div>
          <span className={orderStatusClass[statusValue]}>{statusValue}</span>
        </div>
      );
    },
  },
  {
    title: "Sucursal",
    cell: (rowData) => <div>{rowData.location.name}</div>,
  },
  {
    title: "Sucursal",
    cell: (rowData) => <div>{rowData.location.name}</div>,
  },
  {
    title: "",
    cell: (rowData, cellProps) => {
      console.log(cellProps?.isRowExpanded);

      return (
        <div>
          {cellProps?.isRowExpanded ? (
            <button
              className="rounded-full p-2 hover:bg-primary-foreground"
              onClick={() => cellProps?.toggleRowExpansion()}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          ) : (
            <button
              className="rounded-full p-2 hover:bg-primary-foreground"
              onClick={() => cellProps?.toggleRowExpansion()}
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
    cell: (rowData) => <ActionsDropMenu />,
  },
];

export const equipmentsList = ({ rowData }: { rowData: Order }) => {
  return (
    <div className="grid gap-4">
      {rowData.equipments.map((ownerEquipment) => (
        <div className="flex items-center gap-4">
          {ownerEquipment.equipment.image && (
            <div className="relative h-10 w-10 rounded-full">
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
