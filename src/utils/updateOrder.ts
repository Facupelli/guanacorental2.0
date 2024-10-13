import { type Prisma } from "@prisma/client";
import { prisma } from "./db";
import { calculateOwnerEarning } from "./order";

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

type Cart = {
  id: string;
  quantity: number;
  price: number;
  owner?:
    | {
        id: string;
        stock: number;
        ownerId: string;
        locationId: string;
        ownerName?: string | undefined;
      }[]
    | undefined;
}[];

export const getUpdatedCart = async (cart: Cart) => {
  const equipmentIds = cart.map((item) => item.id);

  const equipments = await prisma.equipment.findMany({
    where: { id: { in: equipmentIds } },
    include: {
      owner: {
        // where: {
        //   deleted: false,
        // },
        include: {
          owner: true,
          location: true,
          books: { include: { book: true } },
        },
      },
    },
  });

  const updatedCart = cart.map((item) => {
    const equipment = equipments.find((equipment) => equipment.id === item.id);

    if (!equipment) {
      throw new Error("Equipment id not found");
    }

    return {
      ...equipment,
      quantity: item.quantity,
    };
  });

  return updatedCart;
};

export const calcualteAndCreateEarnings = async (newOrder: NewOrder) => {
  const earnings = calculateOwnerEarning(newOrder);

  await prisma.earning.create({
    data: {
      oscar: earnings?.oscarEarnings ?? 0,
      federico: earnings?.federicoEarnings ?? 0,
      sub: earnings?.subEarnings ?? 0,
      order: { connect: { id: newOrder.id } },
    },
  });

  return earnings;
};

export const updateEarnings = async (newOrder: NewOrder, orderId: string, earningId: string) => {
  const earnings = calculateOwnerEarning(newOrder);

  await prisma.earning.update({
    where: { id: earningId },
    data: {
      oscar: earnings?.oscarEarnings ?? 0,
      federico: earnings?.federicoEarnings ?? 0,
      sub: earnings?.subEarnings ?? 0,
      order: { connect: { id: newOrder.id } },
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      subtotal: earnings?.subtotal,
      total: earnings?.total,
    },
  });
};
