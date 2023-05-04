import { useBoundStore } from "@/zustand/store";
import { useEffect } from "react";

let didLocationInit = false;

export const useLoadLocationFromLocalStorage = () => {
  const setLocation = useBoundStore((state) => state.setLocation);
  const toggleModal = useBoundStore((state) => state.setToggleModal);

  useEffect(() => {
    if (!didLocationInit) {
      didLocationInit = true;

      const location = localStorage.getItem("location");

      if (location) {
        return setLocation(location);
      }

      toggleModal();
    }
  }, []);
};
