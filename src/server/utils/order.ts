import { getDatesInRange, getTotalWorkingDays } from "@/lib/dates";
import { type CartItem } from "@/types/cart";
import { type Prisma } from "@prisma/client";

type Owner = Prisma.EquipmentOnOwnerGetPayload<{
  include: {
    owner: true;
    location: true;
    books: { include: { book: true } };
  };
}>;

export const getEquipmentOnOwnerIds = (item: CartItem, quantity: number) => {
  // Ordena el arreglo de owners según la prioridad especificada
  const sortByOwnerPriority = (owners: Owner[]) => {
    const ownerPriority = ["Both", "Fede", "Oscar", "Sub"];
    return owners.sort((a, b) => {
      const ownerIndexA = ownerPriority.indexOf(a.owner.name);
      const ownerIndexB = ownerPriority.indexOf(b.owner.name);

      if (ownerIndexA === -1 && ownerIndexB === -1) {
        return 0; // Si ambos ownerName no están en ownerPriority, se mantiene el orden actual
      }
      if (ownerIndexA === -1) {
        return 1; // Si ownerName de 'a' no está en ownerPriority, se coloca al final
      }
      if (ownerIndexB === -1) {
        return -1; // Si ownerName de 'b' no está en ownerPriority, se coloca al final
      }

      return ownerIndexA - ownerIndexB; // Ordenar según la prioridad en ownerPriority
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
    discount: {
      include: {
        rule: {
          include: {
            type: true;
          };
        };
      };
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

export const calculateOwnerEarning = (newOrder: NewOrder) => {
  const { book, equipments, bookId, discount } = newOrder;
  const { start_date, end_date, pickup_hour } = book;

  const datesInRange = getDatesInRange(start_date, end_date);
  if (!pickup_hour) return null;
  const workingDays = getTotalWorkingDays(datesInRange, pickup_hour);
  if (!workingDays) return null;

  let federicoEarnings = 0;
  let oscarEarnings = 0;
  let subEarnings = 0;
  let total = 0;
  let subtotal = 0;

  const equipmentOnOwners = getOrderEquipmentOnOwners(equipments, bookId);

  for (const equipment of equipmentOnOwners) {
    const equipmentPrice = equipment.equipment.price;
    const ownerName = equipment.owner.name;
    const quantity = equipment.books[0]?.quantity;

    if (quantity) {
      let price = workingDays * equipmentPrice * quantity;
      subtotal += price;

      if (discount) {
        const discountValue = price * (discount.rule.value / 100);
        price -= discountValue;
      }
      total += price;

      if (ownerName === "Federico") {
        federicoEarnings += price;
      } else if (ownerName === "Oscar") {
        oscarEarnings += price;
      } else if (ownerName === "Sub") {
        subEarnings += price * 0.7;
        federicoEarnings += price * 0.15;
        oscarEarnings += price * 0.15;
      } else {
        federicoEarnings += price / 2;
        oscarEarnings += price / 2;
      }
    }
  }

  return {
    subtotal,
    total,
    oscarEarnings,
    federicoEarnings,
    subEarnings,
  };
};
