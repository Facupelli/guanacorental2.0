import type { Equipment, Location } from "@/types/models";
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

interface LocationSlice {
  showLocationModal: boolean;
  location: Location;
  setLocation: ({
    locationName,
    locationId,
  }: {
    locationName: string;
    locationId: string;
  }) => void;
  setToggleModal: () => void;
}

const createLocationSlice: StateCreator<
  LocationSlice & DateSlice & CartSlice,
  [],
  [],
  LocationSlice
> = (set) => ({
  showLocationModal: false,
  location: { name: "", id: "" },
  setLocation: ({ locationId, locationName }) =>
    set(() => ({ location: { name: locationName, id: locationId } })),
  setToggleModal: () =>
    set((state) => ({ showLocationModal: !state.showLocationModal })),
});

interface DateSlice {
  pickupHour: string;
  setPickupHour: (hour: string) => void;
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
  startDate: null,
  endDate: null,
  pickupHour: "",
  setPickupHour: (hour) => set(() => ({ pickupHour: hour })),
  setStartDate: (startDate) => set(() => ({ startDate })),
  setEndDate: (endDate) => set(() => ({ endDate })),
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
  emptyCart: () => void;
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
  emptyCart: () => set(() => ({ cartItems: [] })),
});

export const useBoundStore = create<LocationSlice & DateSlice & CartSlice>()(
  devtools((...a) => ({
    ...createLocationSlice(...a),
    ...createDateSlice(...a),
    ...createCartSlice(...a),
  }))
);
