import { useBoundStore } from "@/zustand/store";
import { useEffect } from "react";

type LocationData = {
  locationName: string;
  locationId: string;
};

let didLocationInit = false;

export const useLoadLocationFromLocalStorage = () => {
  const setLocation = useBoundStore((state) => state.setLocation);
  const toggleModal = useBoundStore((state) => state.setToggleModal);
  const setPickupHour = useBoundStore((state) => state.setPickupHour);

  useEffect(() => {
    if (!didLocationInit) {
      didLocationInit = true;

      const location = localStorage.getItem("location.v2");

      if (location) {
        const parsedLocation: LocationData = JSON.parse(
          location
        ) as LocationData;
        if (parsedLocation.locationId && parsedLocation.locationName) {
          setPickupHour("09:00");

          if (parsedLocation) return setLocation(parsedLocation);
        } else {
          localStorage.removeItem("location.v2");
        }
      }

      toggleModal();
    }
  }, [setLocation, setPickupHour, toggleModal]);
};
