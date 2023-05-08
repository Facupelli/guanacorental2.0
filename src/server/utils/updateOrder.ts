import { type Prisma } from "@prisma/client";
import { prisma } from "../db";
import { calculateOwnerEarning } from "./order";

type newOrder = Prisma.OrderGetPayload<{
  include: {
    book: true;
    equipments: {
      include: { books: true; owner: true; equipment: true };
    };
  };
}>;

export const updateEarnings = async (
  newOrder: newOrder,
  orderId: string,
  earningId: string
) => {
  const earnings = calculateOwnerEarning(
    newOrder,
    newOrder.book.start_date,
    newOrder.book.end_date
  );

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
      subtotal:
        (earnings?.federicoEarnings ?? 0) +
        (earnings?.oscarEarnings ?? 0) +
        (earnings?.subEarnings ?? 0),
      total:
        (earnings?.federicoEarnings ?? 0) +
        (earnings?.oscarEarnings ?? 0) +
        (earnings?.subEarnings ?? 0),
    },
  });
};
