import { type Equipment } from "@/types/models";
import { useBoundStore } from "@/zustand/store";
import { useEffect } from "react";

let didCartInit = false;

export const useLoadCartFromLocalStorage = () => {
  const cart = useBoundStore((state) => state.cartItems);
  const setCart = useBoundStore((state) => state.setCart);

  useEffect(() => {
    if (!didCartInit) {
      didCartInit = true;

      if (cart?.length === 0) {
        const localCart = localStorage.getItem("cart.v2");
        if (localCart) {
          const parsedCart = JSON.parse(localCart) as Equipment[];
          setCart(parsedCart);
        }
      }
    }
  }, [cart.length, setCart]);
};
