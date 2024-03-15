import { LocationName } from "@/lib/magic_strings";
import { type Location } from "@/types/models";
import { useEffect, useState } from "react";

export const useMendozaAlert = ({ location }: { location: Location }) => {
  const [showMendozaModal, setShowMendozaModal] = useState(false);

  useEffect(() => {
    if (location.name === LocationName.MENDOZA) {
      setShowMendozaModal(true);
    }
  }, [location]);

  return { showMendozaModal, setShowMendozaModal };
};
