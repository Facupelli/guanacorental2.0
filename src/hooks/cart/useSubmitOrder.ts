"use client";

import { validateOrderSubmission } from "~/utils/validation/validateMakeOrder";
import { useSession } from "next-auth/react";
import { useEndDate, usePickupHour, useStartDate } from "~/stores/date.store";
import { trpc } from "~/trpc/client";
import { type UseFormGetValues } from "react-hook-form";
import { useCartItems } from "~/stores/cart.store";
import { useLocation } from "~/stores/location.store";
import { useCartState } from "./useCartState";
import { type Discount } from "types/models";

export const useSubmitOrder = (
  workingDays: number | undefined,
  getValues: UseFormGetValues<{ message: string; email?: string }>,
  discount: Discount | null
) => {
  const { data: session } = useSession();
  const startDate = useStartDate();
  const endDate = useEndDate();
  const cartItems = useCartItems();
  const pickupHour = usePickupHour();
  const location = useLocation();
  const { mutate } = trpc.order.createOrder.useMutation();

  const { subtotal, cartTotal } = useCartState(workingDays, discount);

  const submitOrder = () => {
    const result = validateOrderSubmission(session, startDate, endDate, workingDays);
    if ("error" in result) {
      throw new Error(result.error);
    }

    const message = getValues("message");
    const email = getValues("email");

    const cart = cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      owner: item.owner?.map((owner) => ({
        id: owner.id,
        ownerId: owner.ownerId,
        onwerName: owner.owner?.name,
        stock: owner.stock,
        locationId: owner.locationId,
      })),
    }));

    mutate(
      {
        discount,
        startDate: result.startDate,
        endDate: result.endDate,
        locationId: location.id,
        customerId: result.session.user.id,
        pickupHour,
        subtotal,
        total: cartTotal,
        message,
        cart,
        workingDays: result.workingDays,
        email: email ? email : null,
      },
      {
        onError: (err) => {
          throw new Error(err.message);
        },
      }
    );
  };

  return { submitOrder };
};
