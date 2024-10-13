import type { Equipment } from "types/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  cartItems: Equipment[];
  showCartModal: boolean;
  actions: {
    setShowCartModal: (show: boolean) => void;
    setOpenCartModal: () => void;
    setCloseCartModal: () => void;
    addToCart: (equipment: Equipment) => void;
    deleteFromCart: (id: string) => void;
    addItemQuantity: (id: string) => void;
    substractItemQuantity: (id: string) => void;
    emptyCart: () => void;
    setCart: (cart: Equipment[]) => void;
  };
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartItems: [],
      showCartModal: false,
      actions: {
        setShowCartModal: (show) => set(() => ({ showCartModal: show })),
        setOpenCartModal: () => set(() => ({ showCartModal: true })),
        setCloseCartModal: () => set(() => ({ showCartModal: false })),
        addToCart: (equipment) => set((state) => ({ cartItems: [...state.cartItems, equipment] })),
        deleteFromCart: (id) =>
          set((state) => ({
            cartItems: state.cartItems.filter((item) => item.id !== id),
          })),
        addItemQuantity: (id) =>
          set((state) => ({
            cartItems: state.cartItems.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  quantity: item.quantity + 1,
                };
              }
              return item;
            }),
          })),
        substractItemQuantity: (id) =>
          set((state) => ({
            cartItems: state.cartItems.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  quantity: item.quantity - 1,
                };
              }
              return item;
            }),
          })),
        emptyCart: () => set(() => ({ cartItems: [] })),
        setCart: (cart) => set(() => ({ cartItems: cart })),
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);

export const useCartItems = () => useCartStore((state) => state.cartItems);
export const useShowCartModal = () => useCartStore((state) => state.showCartModal);

export const useCartStoreActions = () => useCartStore((state) => state.actions);
