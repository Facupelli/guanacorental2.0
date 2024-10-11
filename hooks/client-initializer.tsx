"use client";

import { useEffect } from "react";
import { useLocationStoreActions } from "stores/location.store";

export default function ClientInitializer() {
  const { initializeLocation } = useLocationStoreActions();

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  return null;
}
