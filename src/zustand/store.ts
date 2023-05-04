import { Equipment } from "@/types/models";
import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

interface LocationSlice {
  showLocationModal: boolean;
  location: string;
  setLocation: (location: string) => void;
  setToggleModal: () => void;
}

const createLocationSlice: StateCreator<
  LocationSlice & DateSlice & CartSlice,
  [],
  [],
  LocationSlice
> = (set) => ({
  showLocationModal: false,
  location: "",
  setLocation: (location) => set(() => ({ location })),
  setToggleModal: () =>
    set((state) => ({ showLocationModal: !state.showLocationModal })),
});

interface DateSlice {
  showDateModal: boolean;
  setOpenDateModal: () => void;
  setCloseDateModal: () => void;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
}

const createDateSlice: StateCreator<
  LocationSlice & DateSlice & CartSlice,
  [],
  [],
  DateSlice
> = (set) => ({
  showDateModal: false,
  startDate: null,
  endDate: null,
  setStartDate: (startDate) => set(() => ({ startDate })),
  setEndDate: (endDate) => set(() => ({ endDate })),
  setOpenDateModal: () => set(() => ({ showDateModal: true })),
  setCloseDateModal: () => set(() => ({ showDateModal: false })),
});

interface CartSlice {
  cartItems: Equipment[];
  showCartModal: boolean;
  setOpenCartModal: () => void;
  setCloseCartModal: () => void;
  addToCart: (equipment: Equipment) => void;
  deleteFromCart: (id: string) => void;
  addItemQuantity: (id: string) => void;
  substractItemQuantity: (id: string) => void;
}

const createCartSlice: StateCreator<
  LocationSlice & DateSlice & CartSlice,
  [],
  [],
  CartSlice
> = (set) => ({
  cartItems: [],
  showCartModal: false,
  setOpenCartModal: () => set(() => ({ showCartModal: true })),
  setCloseCartModal: () => set(() => ({ showCartModal: false })),
  addToCart: (equipment) =>
    set((state) => ({ cartItems: [...state.cartItems, equipment] })),
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
        } else {
          return item;
        }
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
        } else {
          return item;
        }
      }),
    })),
});

export const useBoundStore = create<LocationSlice & DateSlice & CartSlice>()(
  devtools((...a) => ({
    ...createLocationSlice(...a),
    ...createDateSlice(...a),
    ...createCartSlice(...a),
  }))
);
