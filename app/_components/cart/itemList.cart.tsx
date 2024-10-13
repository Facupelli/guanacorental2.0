"use client";

import CartItemCounter from "@components/CartItemCounter";
import { formatPrice, isEquipmentAvailable } from "~/lib/utils";
import type { Equipment } from "types/models";
import { X } from "lucide-react";
import { useCartItems, useCartStoreActions } from "~/stores/cart.store";
import { useEndDate, useStartDate } from "~/stores/date.store";

export default function ItemsList() {
  const items = useCartItems();

  return (
    <div className="grid gap-4">
      {items.length > 0 ? (
        items.map((item) => <Item key={item.id} item={item} />)
      ) : (
        <div>No tienes equipos agregados al carrito! Ingresa a reservas onlines para ver los equipos dispobibles.</div>
      )}
    </div>
  );
}

const Item = (props: { item: Equipment }) => {
  const startDate = useStartDate();
  const endDate = useEndDate();
  const { deleteFromCart } = useCartStoreActions();

  const handleRemoveFromCart = (itemId: string) => {
    deleteFromCart(itemId);
  };

  const available = isEquipmentAvailable(props.item, { startDate, endDate });

  return (
    <div className="props.items-center grid grid-cols-12 gap-y-2 rounded-md bg-white/40 p-2 pb-4 sm:gap-y-0 md:border-none">
      <div className="col-span-12 sm:col-span-7">
        <p>
          <strong className="font-extrabold">
            {props.item.name} {props.item.brand}
          </strong>{" "}
          <strong className="font-semibold">{props.item.model}</strong>
        </p>
        <p className={`col-span-12 text-sm ${available ? "text-green-500" : "text-red-500"}`}>
          {available ? "Disponible" : "Reservado"}
        </p>
      </div>
      <div className="col-span-5 sm:col-span-2">
        <CartItemCounter item={props.item} />
      </div>
      <p className="col-span-5 text-lg font-semibold sm:col-span-2">
        {formatPrice(props.item.price * props.item.quantity)}
      </p>
      <button
        className="col-span-2 flex justify-end sm:col-span-1 "
        onClick={() => handleRemoveFromCart(props.item.id)}
      >
        <X className=" h-4 w-4 " />
      </button>
    </div>
  );
};
