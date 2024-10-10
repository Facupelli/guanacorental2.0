"use client";

import { useLoadLocationFromLocalStorage } from "@/hooks/useLoadLocationFromLocalStorage";

export default function ClientInitializer() {
  useLoadLocationFromLocalStorage();

  return null;
}
