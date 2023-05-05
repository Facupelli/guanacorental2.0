import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { getEquipmentOnOwnerIds } from "@/server/utils/order";
import { STATUS } from "@/lib/magic_strings";

type Query = {
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
  };
};

export const orderRouter = createTRPCRouter({
  getOrders: protectedProcedure
    .input(
      z.object({
        take: z.number(),
        skip: z.number(),
        location: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { skip, take, location } = input;

      const query: Query = {
        take,
        skip,
        include: {
          customer: {
            include: { address: true },
          },
          location: true,
          book: true,
        },
      };

      if (location !== "all") {
        query.where = { locationId: location };
      }

      console.log("QUERYYYYYYYYYYYY", location);

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

      const equipmentOnOwnerIds = cart
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
      try {
        const newOrder = await prisma.order.create({
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
        });

        return newOrder;
      } catch (err) {
        await prisma.bookOnEquipment.deleteMany({
          where: {
            bookId: newBook.id,
          },
        });

        await prisma.book.delete({
          where: { id: newBook.id },
        });

        console.log(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Create Order failed, please try again later",
        });
      }
    }),
});
