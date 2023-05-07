import type { Equipment, EquipmentOnOwner } from "@/types/models";
import { ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumSignificantDigits: 12,
  }).format(price);
};

const checkStock = (owners: EquipmentOnOwner[], quantity: number) => {
  let totalStock = 0;
  for (const owner of owners) {
    totalStock += owner.stock;
  }
  if (totalStock < quantity) {
    return false;
  }
  return totalStock;
};

export const isEquipmentAvailable = (
  equipment: Equipment,
  dates: { startDate: Date | null; endDate: Date | null }
) => {
  if (dates.startDate && dates.endDate) {
    // Verificar si el stock es suficiente
    const stock = checkStock(equipment.owner!, equipment.quantity);
    if (!stock) {
      return false;
    }

    let available = true;

    // Verificar si el equipo está disponible para las fechas solicitadas
    for (const owner of equipment.owner!) {
      for (const book of owner.books!) {
        if (
          dayjs(dates.startDate).isBefore(book.book?.end_date!, "day") &&
          dayjs(dates.endDate).isAfter(book.book?.start_date, "day")
        ) {
          available = false;
        }
      }
    }
    return available;
  }
  return true;
};

export const handleLocationChange = (
  e: string,
  setLocation: (location: { locationId: string; locationName: string }) => void,
  toggleModal?: () => void
) => {
  const locationId = e.split("-")[0];
  const locationName = e.split("-")[1];

  console.log(locationId, locationName);
  if (locationId && locationName) {
    setLocation({ locationId, locationName });
    localStorage.setItem(
      "location",
      JSON.stringify({ locationId, locationName })
    );
    if (toggleModal) {
      toggleModal();
    }
  }
};
