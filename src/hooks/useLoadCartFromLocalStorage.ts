import { useBoundStore } from "@/zustand/store";
import { useEffect } from "react";

type LocationData = {
  locationName: string;
  locationId: string;
};

let didCartInit = false;

export const useLoadCartFromLocalStorage = () => {
  const cart = useBoundStore((state) => state.cartItems);
  const setCart = useBoundStore((state) => state.setCart);

  useEffect(() => {
    if (!didCartInit) {
      didCartInit = true;

      if (cart?.length === 0) {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
      }
    }
  }, [cart.length, setCart]);
};
