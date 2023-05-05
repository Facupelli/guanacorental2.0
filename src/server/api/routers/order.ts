import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const orderRouter = createTRPCRouter({
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

      const newBook = await prisma.book.create({
        data: {
          start_date: startDate,
          end_date: endDate,
          pickup_hour: pickupHour,
        },
      });

      try {
        await prisma.$transaction(
          cart.map((item) =>
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
        console.log("BOOK ON EQUIPMENT ERROR", err);
      }

      const equipmentsIds = cart.map((item) => ({ id: item.id }));

      const newOrder = await prisma.order.create({
        data: {
          customer: { connect: { id: customerId } },
          equipments: { connect: equipmentsIds },
          book: { connect: { id: newBook.id } },
          location: { connect: { id: locationId } },
          total,
          subtotal,
          message,
          status: "",
        },
      });

      return newOrder;
    }),
});
