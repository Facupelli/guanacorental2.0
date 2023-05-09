import { getDatesInRange, getTotalWorkingDays } from "@/lib/dates";
import { type Prisma } from "@prisma/client";

type CartItem = {
  id?: string;
  quantity: number;
  price: number;
  owner?:
    | {
        id: string;
        ownerId: string;
        stock: number;
        locationId: string;
        ownerName?: string | undefined;
      }[]
    | undefined;
};

type Owner = {
  id: string;
  ownerId: string;
  stock: number;
  locationId: string;
  ownerName?: string | undefined;
};

export const getEquipmentOnOwnerIds = (item: CartItem, quantity: number) => {
  // Ordena el arreglo de owners según la prioridad especificada
  const sortByOwnerPriority = (owners: Owner[]) => {
    const ownerPriority = ["Both", "Fede", "Oscar", "Sub"];
    return owners.sort((a, b) => {
      if (a.ownerName && b.ownerName) {
        return (
          ownerPriority.indexOf(a.ownerName) -
          ownerPriority.indexOf(b.ownerName)
        );
      }
      return 1;
    });
  };

  const owners = sortByOwnerPriority(item.owner!);

  // Recorre cada dueño para obtener la cantidad deseada
  let remainingQuantity = quantity;
  const result: { id: string; quantity: number }[] = [];
  for (const owner of owners) {
    if (owner.stock >= remainingQuantity) {
      // Si el dueño tiene suficiente stock, agrega su ID y la cantidad deseada y finaliza el bucle
      result.push({ id: owner.id, quantity: remainingQuantity });
      break;
    } else {
      // Si el dueño no tiene suficiente stock, agrega su ID y la cantidad de stock disponible y actualiza la cantidad restante
      result.push({ id: owner.id, quantity: owner.stock });
      remainingQuantity -= owner.stock;
    }
  }

  return result;
};

type NewOrder = Prisma.OrderGetPayload<{
  include: {
    book: true;
    equipments: {
      include: { books: true; owner: true; equipment: true };
    };
  };
}>;

type EquipmentOwner = Prisma.EquipmentOnOwnerGetPayload<{
  include: {
    books: true;
    owner: true;
    equipment: true;
  };
}>;

export const getOrderEquipmentOnOwners = (
  equipments: EquipmentOwner[],
  bookId: string
) => {
  const equipmentOnOwners = equipments.map((item: EquipmentOwner) => ({
    ...item,
    books: item.books?.filter((book) => book.bookId === bookId),
  }));
  return equipmentOnOwners;
};

export const calculateOwnerEarning = (
  newOrder: NewOrder,
  startDate: Date,
  endDate: Date
) => {
  let federicoEarnings = 0;
  let oscarEarnings = 0;
  let subEarnings = 0;

  const datesInRange = getDatesInRange(startDate, endDate);
  if (newOrder.book.pickup_hour) {
    const workingDays = getTotalWorkingDays(
      datesInRange,
      newOrder.book.pickup_hour
    );

    const equipmentOnOwners = getOrderEquipmentOnOwners(
      newOrder.equipments,
      newOrder.bookId
    );

    for (const equipment of equipmentOnOwners) {
      const ownerName = equipment.owner.name;
      const total = newOrder.total;

      if (ownerName === "Federico") {
        federicoEarnings += total;
      } else if (ownerName === "Oscar") {
        oscarEarnings += total;
      } else if (ownerName === "Sub") {
        subEarnings += total * 0.7;
        federicoEarnings += total * 0.15;
        oscarEarnings += total * 0.15;
      } else {
        federicoEarnings += total / 2;
        oscarEarnings += total / 2;
      }
    }

    return {
      oscarEarnings,
      federicoEarnings,
      subEarnings,
    };
  }
};
