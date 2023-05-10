import { ChevronDown, ChevronUp } from "lucide-react";
import { statusClass } from "@/lib/magic_strings";
import { formatPrice } from "@/lib/utils";
import { Button } from "./ui/button";
import { SyntheticEvent, useState } from "react";
import { type Prisma } from "@prisma/client";
import { useRouter } from "next/router";
import Image from "next/image";

type OrderRowProps = Prisma.OrderGetPayload<{
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
  };
}>;

const OrderRow = ({
  order,
  calendarView,
}: {
  order: OrderRowProps;
  calendarView?: boolean;
}) => {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const handleShowMore = (e: SyntheticEvent) => {
    e.stopPropagation();

    setShowMore((prev) => !prev);
  };

  const handleClickOrder = (orderId: string) => {
    void router.push(`/admin/orders/${orderId}`);
  };

  return (
    <>
      <tr
        key={order.id}
        className="cursor-pointer border-t border-app-bg text-sm first:border-none"
        onClick={() => handleClickOrder(order.id)}
      >
        <td className="py-5">{order.number}</td>
        <td className="py-5">{order.customer.name}</td>
        {!calendarView && (
          <td className="py-5">{order.customer.address?.phone}</td>
        )}
        <td className="py-5">
          {new Date(order.book.start_date).toLocaleDateString()} -{" "}
          {order.book.pickup_hour}hs
        </td>
        <td className="py-5">
          {new Date(order.book.end_date).toLocaleDateString()}
        </td>
        <td className="py-5 text-xs font-bold">
          <span className={statusClass[order.status]}>
            {order.status ?? "-"}
          </span>
        </td>
        <td className="py-5">{formatPrice(order.total)}</td>
        {!calendarView && (
          <td className="py-5">
            <Button className="h-5 text-xs" size="sm">
              Generar
            </Button>
          </td>
        )}
        <td className="py-5">{order.location.name}</td>
        <td className="py-5">
          <Button
            variant="ghost"
            className="h-6 p-2"
            size="sm"
            onClick={(e) => handleShowMore(e)}
          >
            {showMore ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </td>
      </tr>
      {showMore &&
        order.equipments.map((ownerEquipment, i) => (
          <tr key={ownerEquipment.id} className="text-sm">
            {ownerEquipment.equipment.image && (
              <td className="w-10">
                <div className="relative h-10 w-10">
                  <Image
                    src={ownerEquipment.equipment.image}
                    alt="equipment picture"
                    fill
                  />
                </div>
              </td>
            )}
            <td
              colSpan={3}
              className={`${
                i === order.equipments.length - 1 ? "pb-5" : "py-1"
              } px-2`}
            >
              <div className="flex items-center gap-2">
                <p className="font-semibold">{ownerEquipment.equipment.name}</p>
                <p className="font-semibold">
                  {ownerEquipment.equipment.brand}
                </p>
                <p>{ownerEquipment.equipment.model}</p>
              </div>
            </td>
            <td
              className={`${
                i === order.equipments.length - 1 ? "pb-5" : "py-1"
              } px-2`}
            >
              x
              {ownerEquipment.books.reduce((acc, curr) => {
                return acc + curr.quantity;
              }, 0)}
            </td>
          </tr>
        ))}
    </>
  );
};

export default OrderRow;
