import { orderStatusClass } from "./magic_strings";
import ActionsDropMenu from "@/components/order/ActionDropMenu";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type Columns } from "@/types/table";
import { type Prisma } from "@prisma/client";
import { type MouseEvent } from "react";

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

type CellProps = unknown;

export const orderColumns: Columns<Order, CellProps>[] = [
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
    cell: (rowData) => <ActionsDropMenu order={rowData} />,
  },
];

export const equipmentsList = ({ rowData }: { rowData: Order }) => {
  return (
    <div className="grid gap-4">
      {rowData.equipments.map((ownerEquipment) => (
        <div key={ownerEquipment.id} className="flex items-center gap-4">
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
