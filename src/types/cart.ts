import { type Prisma } from "@prisma/client";

export type CartItem = Prisma.EquipmentGetPayload<{
  include: {
    owner: {
      include: {
        owner: true;
        location: true;
        books: { include: { book: true } };
      };
    };
  };
}>;
