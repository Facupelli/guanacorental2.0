import type { Location } from "@/types/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationStore {
  showLocationModal: boolean;
  location: Location;
  pickupHour: string;
  actions: {
    setLocation: (location: Location) => void;
    toggleModal: () => void;
    setPickupHour: (hour: string) => void;
    initializeLocation: () => void;
  };
}

const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      showLocationModal: false,
      location: { name: "", id: "" },
      pickupHour: "",
      actions: {
        setLocation: (location) => set({ location }),
        toggleModal: () => set((state) => ({ showLocationModal: !state.showLocationModal })),
        setPickupHour: (hour) => set({ pickupHour: hour }),
        initializeLocation: () => {
          const { location } = get();
          if (!location.id || !location.name) {
            console.log("INITIALIZE SHOW LOCATION MODAL");
            set({ showLocationModal: true });
          } else {
            set({ pickupHour: "09:00" });
          }
        },
      },
    }),
    {
      name: "location-storage",
      partialize: (state) => ({ location: state.location }),
    }
  )
);

export const useShowLocationModal = () => useLocationStore((state) => state.showLocationModal);
export const useLocation = () => useLocationStore((state) => state.location);

export const useLocationStoreActions = () => useLocationStore((state) => state.actions);
