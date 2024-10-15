"use client";

import { useMemo } from "react";
import { type Discount } from "types/models";
import { calcaulateCartTotal, calculateTotalWithDiscount, isEquipmentAvailable } from "~/lib/utils";
import { useCartItems } from "~/stores/cart.store";
import { useEndDate, useStartDate } from "~/stores/date.store";

export const useCartState = (workingDays: number | undefined, discount: Discount | null) => {
  const cartItems = useCartItems();
  const startDate = useStartDate();
  const endDate = useEndDate();

  const subtotal = useMemo(() => calcaulateCartTotal(cartItems, workingDays), [cartItems, workingDays]);

  const cartTotal = useMemo(() => {
    if (workingDays) {
      const total = subtotal;
      if (discount) {
        return calculateTotalWithDiscount(total, discount);
      }
      return total;
    }
    return 0;
  }, [workingDays, discount, subtotal]);

  const areAllItemsAvailable = useMemo(
    () => cartItems.every((item) => isEquipmentAvailable(item, { startDate, endDate })),
    [cartItems, startDate, endDate]
  );

  return { subtotal, cartTotal, areAllItemsAvailable };
};
