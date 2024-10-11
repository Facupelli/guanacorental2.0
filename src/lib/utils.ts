import { type Session } from "next-auth";
import dayjs from "dayjs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Prisma } from "@prisma/client";
import type { Equipment, EquipmentOnOwner, Location } from "@/types/models";
import { COUPON_STATUS, DISCOUNT_TYPES, ROLES } from "./constants";

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
    if (!owner.deleted) {
      totalStock += owner.stock;
    }
  }
  if (totalStock < quantity) {
    return false;
  }
  return totalStock;
};

export const isEquipmentAvailable = (
  equipment: Equipment,
  dates: { startDate: Date | undefined; endDate: Date | undefined }
) => {
  if (dates.startDate && dates.endDate) {
    // Verificar si el stock es suficiente

    const stock = checkStock(equipment.owner!, equipment.quantity);

    if (!stock) {
      return false;
    }

    let stockLeft = stock;

    // Verificar si el equipo está disponible para las fechas solicitadas
    for (const owner of equipment.owner!) {
      for (const book of owner.books!) {
        if (
          dayjs(dates.startDate).isBefore(book.book?.end_date, "day") &&
          dayjs(dates.endDate).isAfter(book.book?.start_date, "day")
        ) {
          stockLeft -= book.quantity;
          // available = false;
        }
      }
    }
    return stockLeft - equipment.quantity < 0 ? false : true;
  }
  return true;
};

export const handleLocationChange = (
  e: string,
  setLocation: (location: Location) => void,
  toggleModal?: () => void
) => {
  const locationId = e.split("-")[0];
  const locationName = e.split("-")[1];

  if (locationId && locationName) {
    setLocation({ id: locationId, name: locationName });
    if (toggleModal) {
      toggleModal();
    }
  }
};

export const handleAdminLocationChange = (e: string, setLocation: (location: Location) => void) => {
  const locationId = e.split("-")[0];
  const locationName = e.split("-")[1];
  if (locationId && locationName) {
    setLocation({ id: locationId, name: locationName });
  }
};

export const getIsAdmin = (session: Session | null) => {
  return session?.user.role.map((role) => role.name).includes(ROLES.ADMIN);
};

export const getIsEmployee = (session: Session | null) => {
  return session?.user.role.map((role) => role.name).includes(ROLES.EMPLOYEE);
};

export const calcaulateCartTotal = (cartItems: Equipment[], workingDays: number | undefined) => {
  const cartSum = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  if (workingDays) {
    return workingDays * cartSum;
  }
  return 0;
};

type DiscountProp = {
  value: number;
  typeName: string;
  code: string;
};

export const calculateTotalWithDiscount = (total: number, discount: DiscountProp) => {
  if (discount.typeName === DISCOUNT_TYPES.FIXED) {
    return Math.ceil(total - discount.value);
  }

  if (discount.typeName === DISCOUNT_TYPES.PERCENTAGE) {
    return Math.ceil(total - total * (discount.value / 100));
  }

  return total;
};

type Discount = Prisma.DiscountGetPayload<{
  include: {
    rule: {
      include: {
        type: true;
      };
    };
    location: true;
  };
}>;

export const getDiscountStatus = (discount: Discount) => {
  if (dayjs().isBefore(dayjs(discount.starts_at))) {
    return COUPON_STATUS.PENDING;
  }
  if (
    dayjs().isAfter(dayjs(discount.ends_at)) ||
    (discount.usage_limit && discount.usage_count >= discount.usage_limit)
  ) {
    return COUPON_STATUS.ENDED;
  }

  return COUPON_STATUS.ACTIVE;
};
