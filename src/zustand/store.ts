import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

interface LocationSlice {
  showModal: boolean;
  location: string;
  setLocation: (location: string) => void;
  setToggleModal: () => void;
}

const createLocationSlice: StateCreator<
  LocationSlice & DateSlice,
  [],
  [],
  LocationSlice
> = (set) => ({
  showModal: false,
  location: "San Juan",
  setLocation: (location) => set(() => ({ location })),
  setToggleModal: () => set((state) => ({ showModal: !state.showModal })),
});

interface DateSlice {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
}

const createDateSlice: StateCreator<
  LocationSlice & DateSlice,
  [],
  [],
  DateSlice
> = (set) => ({
  startDate: null,
  endDate: null,
  setStartDate: (startDate) => set(() => ({ startDate })),
  setEndDate: (endDate) => set(() => ({ endDate })),
});

export const useBoundStore = create<LocationSlice & DateSlice>()(
  devtools((...a) => ({
    ...createLocationSlice(...a),
    ...createDateSlice(...a),
  }))
);
