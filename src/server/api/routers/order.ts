import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import {
  calculateOwnerEarning,
  getEquipmentOnOwnerIds,
} from "@/server/utils/order";
import { ADMIN_ORDERS_SORT, STATUS } from "@/lib/magic_strings";
import { Prisma } from "@prisma/client";
import { isEquipmentAvailable } from "@/lib/utils";

type SortPipe = {
  // created_at?: string;
  book?: {
    start_date?: string;
  };
};

type Query = {
  orderBy?: Prisma.OrderOrderByWithRelationInput;
  where?: {
    locationId?: string;
  };
  take: number;
  skip: number;
  include: {
    customer: {
      include: {
        address: boolean;
      };
    };
    location: boolean;
    book: boolean;
    equipments: {
      include: { books: boolean; equipment: true; owner: true };
    };
    earnings: boolean;
  };
};

export const orderRouter = createTRPCRouter({
  getOrders: protectedProcedure
    .input(
      z.object({
        take: z.number(),
        skip: z.number(),
        location: z.string(),
        sort: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { skip, take, location, sort } = input;

      const query: Query = {
        take,
        skip,
        include: {
          customer: {
            include: { address: true },
          },
          location: true,
          book: true,
          equipments: {
            include: { books: true, equipment: true, owner: true },
          },
          earnings: true,
        },
      };

      if (location !== "all") {
        query.where = { locationId: location };
      }

      if (sort === ADMIN_ORDERS_SORT["NEXT ORDERS"]) {
        query.orderBy = { book: { start_date: "asc" } };
      }

      if (sort === ADMIN_ORDERS_SORT["LAST ORDERS"]) {
        query.orderBy = { created_at: "asc" };
      }

      if (sort === ADMIN_ORDERS_SORT.HISTORY) {
        query.orderBy = { book: { start_date: "asc" } };
      }

      const orders = await prisma.order.findMany(query);

      const totalCount = await prisma.order.count();

      return { orders, totalCount };
    }),

  createOrder: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        pickupHour: z.string(),
        message: z.string(),
        customerId: z.string(),
        locationId: z.string(),
        subtotal: z.number(),
        total: z.number(),
        cart: z.array(
          z.object({
            id: z.string(),
            quantity: z.number(),
            price: z.number(),
            owner: z
              .array(
                z.object({
                  id: z.string(),
                  ownerId: z.string(),
                  ownerName: z.string().optional(),
                  stock: z.number(),
                  locationId: z.string(),
                })
              )
              .optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const {
        startDate,
        endDate,
        pickupHour,
        locationId,
        message,
        customerId,
        cart,
        subtotal,
        total,
      } = input;

      const equipmentIds = cart.map((item) => item.id);

      //GET UPDATED CART WITH MOST RECENT BOOKS
      const equipments = await prisma.equipment.findMany({
        where: { id: { in: equipmentIds } },
        include: {
          owner: {
            include: {
              owner: true,
              location: true,
              books: { include: { book: true } },
            },
          },
        },
      });

      const updatedCart = cart.map((item) => {
        const equipment = equipments.find(
          (equipment) => equipment.id === item.id
        );

        if (!equipment) {
          throw new Error("Equipment id not found");
        }

        return {
          ...equipment,
          quantity: item.quantity,
        };
      });

      //CHECK ALL EQUIPMENT AVAILABILITY
      if (
        !updatedCart.every((item) =>
          isEquipmentAvailable(item, { startDate, endDate })
        )
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Some equipment is not available",
        });
      }

      //CREATE BOOK WITH DATES AND HOUR OF RENT
      const newBook = await prisma.book.create({
        data: {
          start_date: startDate,
          end_date: endDate,
          pickup_hour: pickupHour,
        },
      });

      if (!newBook) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Create Book failed",
        });
      }

      //CHOOSE THE EQUIPMENT TO BOOK

      const equipmentOnOwnerIds = updatedCart
        .map((item) => getEquipmentOnOwnerIds(item, item.quantity))
        .flat();

      //CREATE BOOK TO THOSE EQUIPMENTS
      try {
        await prisma.$transaction(
          equipmentOnOwnerIds.map((item) =>
            prisma.bookOnEquipment.create({
              data: {
                book: { connect: { id: newBook.id } },
                equipment: { connect: { id: item.id } },
                quantity: item.quantity,
              },
            })
          )
        );
      } catch (err) {
        await prisma.book.delete({
          where: { id: newBook.id },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Create BookOnEquipment failed",
        });
      }

      const equipmentsIds = equipmentOnOwnerIds.map((item) => ({
        id: item.id,
      }));

      //CREATE ORDER WITH THE EQUIPMENONBOOKS IDS
      let newOrder;

      try {
        newOrder = await prisma.order.create({
          data: {
            customer: { connect: { id: customerId } },
            equipments: { connect: equipmentsIds },
            book: { connect: { id: newBook.id } },
            location: { connect: { id: locationId } },
            total,
            subtotal,
            message,
            status: STATUS.PENDING,
          },
          include: {
            book: true,
            equipments: {
              include: { books: true, owner: true, equipment: true },
            },
          },
        });
      } catch (err) {
        await prisma.bookOnEquipment.deleteMany({
          where: {
            bookId: newBook.id,
          },
        });

        await prisma.book.delete({
          where: { id: newBook.id },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Create Order failed, please try again later",
        });
      }

      //CALCULATE AND CREATE EARNINGS FOR EACH OWNER

      const earnings = calculateOwnerEarning(newOrder, startDate, endDate);

      await prisma.earning.create({
        data: {
          oscar: earnings?.oscarEarnings ?? 0,
          federico: earnings?.federicoEarnings ?? 0,
          sub: earnings?.subEarnings ?? 0,
          order: { connect: { id: newOrder.id } },
        },
      });

      return { newOrder, earnings };
    }),
});
