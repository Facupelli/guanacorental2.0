import { create } from "zustand";

interface DateStore {
  pickupHour: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  actions: {
    setPickupHour: (hour: string) => void;
    setStartDate: (date: Date | undefined) => void;
    setEndDate: (date: Date | undefined) => void;
  };
}

const useDateStore = create<DateStore>((set) => ({
  startDate: undefined,
  endDate: undefined,
  pickupHour: "",
  actions: {
    setPickupHour: (hour) => set(() => ({ pickupHour: hour })),
    setStartDate: (startDate) => set(() => ({ startDate })),
    setEndDate: (endDate) => set(() => ({ endDate })),
  },
}));

export const useStartDate = () => useDateStore((state) => state.startDate);
export const useEndDate = () => useDateStore((state) => state.endDate);
export const usePickupHour = () => useDateStore((state) => state.pickupHour);

export const useDateStoreActions = () => useDateStore((state) => state.actions);
