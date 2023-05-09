import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import {
  calculateOwnerEarning,
  getEquipmentOnOwnerIds,
} from "@/server/utils/order";
import { ADMIN_ORDERS_SORT, STATUS } from "@/lib/magic_strings";
import { type Prisma } from "@prisma/client";
import { isEquipmentAvailable } from "@/lib/utils";
import {
  calcualteAndCreateEarnings,
  getUpdatedCart,
  updateEarnings,
} from "@/server/utils/updateOrder";

type Query = {
  orderBy?: Prisma.OrderOrderByWithRelationAndSearchRelevanceInput;
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

const cartValidation = z.array(
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
);

export const orderRouter = createTRPCRouter({
  removeEquipmentFromOrder: protectedProcedure
    .input(
      z.object({
        ownerEquipment: z.object({
          id: z.string(),
          quantity: z.number(),
          price: z.number(),
        }),
        bookId: z.string(),
        orderId: z.string(),
        earningId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { ownerEquipment, bookId, orderId, earningId } = input;

      const bookOnEquipment = await prisma.bookOnEquipment.deleteMany({
        where: {
          bookId,
          equipmentId: ownerEquipment.id,
        },
      });

      const newOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          equipments: { disconnect: { id: ownerEquipment.id } },
        },
        include: {
          book: true,
          equipments: {
            include: { books: true, owner: true, equipment: true },
          },
        },
      });

      await updateEarnings(newOrder, orderId, earningId);

      return { message: "success" };
    }),

  addEquipmentToOrder: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        orderId: z.string(),
        cart: cartValidation,
        earningId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { orderId, cart, bookId, earningId } = input;

      //GET UPDATED CART WITH MOST RECENT BOOKS
      const updatedCart = await getUpdatedCart(cart);

      //CHECK ALL EQUIPMENT AVAILABILITY
      const book = await prisma.book.findUnique({ where: { id: bookId } });

      if (!book) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order book not found",
        });
      }

      if (
        !updatedCart.every((item) =>
          isEquipmentAvailable(item, {
            startDate: book.start_date,
            endDate: book.end_date,
          })
        )
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Some equipment is not available",
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
                book: { connect: { id: bookId } },
                equipment: { connect: { id: item.id } },
                quantity: item.quantity,
              },
            })
          )
        );
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Create BookOnEquipment failed",
        });
      }

      const equipmentsIds = equipmentOnOwnerIds.map((item) => ({
        id: item.id,
      }));

      //UPDATE ORDER WITH THE EQUIPMENONBOOKS IDS
      let newOrder;

      newOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          equipments: { connect: equipmentsIds },
        },
        include: {
          book: true,
          equipments: {
            include: { books: true, owner: true, equipment: true },
          },
        },
      });

      //CAMBIAR EL TOTAL

      await updateEarnings(newOrder, orderId, earningId);

      return newOrder;
    }),

  getOrderById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
      });

      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }

      return order;
    }),

  getCalendarOrders: protectedProcedure
    .input(z.object({ location: z.string() }))
    .query(async ({ input }) => {
      const orders = await prisma.order.findMany({
        where: {
          book: {
            start_date: { gte: new Date() },
          },
          locationId: input.location,
        },
        include: {
          book: true,
          equipments: {
            include: { books: true, owner: true, equipment: true },
          },
          customer: {
            include: {
              address: true,
            },
          },
          location: true,
        },
      });

      return orders;
    }),

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
        email: z.string().email().nullish(),
        startDate: z.date(),
        endDate: z.date(),
        workingDays: z.number(),
        pickupHour: z.string(),
        message: z.string(),
        customerId: z.string(),
        locationId: z.string(),
        subtotal: z.number(),
        total: z.number(),
        cart: cartValidation,
      })
    )
    .mutation(async ({ input }) => {
      const {
        email,
        startDate,
        endDate,
        pickupHour,
        locationId,
        message,
        customerId,
        cart,
        subtotal,
        total,
        workingDays,
      } = input;

      let customer;

      if (email) {
        customer = await prisma.user.findUnique({
          where: { email },
        });

        console.log(
          "0----------------------------------->",
          customer,
          !!customer
        );

        if (!customer) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wrong customer email, customer does not exist",
          });
        }
      }

      //GET UPDATED CART WITH MOST RECENT BOOKS

      const updatedCart = await getUpdatedCart(cart);

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
          working_days: workingDays,
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
            customer: { connect: { id: customer ? customer.id : customerId } },
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

      const earnings = await calcualteAndCreateEarnings(newOrder);

      return { newOrder, earnings };
    }),
});
