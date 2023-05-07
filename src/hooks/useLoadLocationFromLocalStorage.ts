import { SCHEDULES } from "@/lib/magic_strings";
import { useBoundStore } from "@/zustand/store";
import { useEffect } from "react";

let didLocationInit = false;

export const useLoadLocationFromLocalStorage = () => {
  const setLocation = useBoundStore((state) => state.setLocation);
  const toggleModal = useBoundStore((state) => state.setToggleModal);
  const setPickupHour = useBoundStore((state) => state.setPickupHour);

  useEffect(() => {
    if (!didLocationInit) {
      didLocationInit = true;

      const location = localStorage.getItem("location");

      if (location) {
        setPickupHour("09:00");
        return setLocation(JSON.parse(location));
      }

      toggleModal();
    }
  }, []);
};
