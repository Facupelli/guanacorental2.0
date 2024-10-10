import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import {
  getEquipmentOnOwnerIds,
  getOrderEquipmentOnOwners,
} from "@/server/utils/order";
import {
  ADMIN_ORDERS_SORT,
  ORDER_DELIVER_STATUS,
  ORDER_RETURN_STATUS,
} from "@/lib/constants";
import { type Prisma } from "@prisma/client";
import { formatPrice, isEquipmentAvailable } from "@/lib/utils";
import {
  calcualteAndCreateEarnings,
  getUpdatedCart,
  updateEarnings,
} from "@/server/utils/updateOrder";
import dayjs from "dayjs";
import {
  sendCancelOrderMail,
  sendMail,
  sendMailToGuanaco,
} from "@/server/utils/mailer";
import { toArgentinaDate } from "@/lib/dates";

type GetClaendarOrdersQuery = {
  where: {
    book: {
      start_date: { gte: Date };
    };
    locationId?: string;
  };
  include: {
    customer: {
      include: {
        address: boolean;
      };
    };
    location: boolean;
    book: boolean;
    equipments: {
      include: { books: boolean; owner: boolean; equipment: boolean };
    };
    earning: boolean;
  };
};

type Query = {
  orderBy?: Prisma.OrderOrderByWithRelationAndSearchRelevanceInput;
  where?: {
    locationId?: string;
    number?: number;
    book?: {
      start_date: { gte: Date };
    };
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
    earning: boolean;
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
        discountId: z.string().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const { ownerEquipment, bookId, orderId, earningId } = input;

      await prisma.bookOnEquipment.deleteMany({
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
          discount: {
            include: {
              rule: {
                include: {
                  type: true,
                },
              },
            },
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
        discountId: z.string().nullish(),
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
          message: "Alguno de los equipos no está disponible para la fecha",
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

      const newOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          equipments: { connect: equipmentsIds },
        },
        include: {
          book: true,
          equipments: {
            include: { books: true, owner: true, equipment: true },
          },
          discount: {
            include: {
              rule: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
      });

      //UPDATE EARNINGS ACCORDING TO NEW EQUIPMENT

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
          earning: true,
          discount: {
            include: { rule: true },
          },
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
      const date = dayjs().subtract(1, "month").toDate();

      const query: GetClaendarOrdersQuery = {
        where: {
          book: {
            start_date: { gte: date },
          },
        },
        include: {
          customer: {
            include: {
              address: true,
            },
          },
          location: true,
          book: true,
          equipments: {
            include: { books: true, owner: true, equipment: true },
          },
          earning: true,
        },
      };

      if (input.location !== "all") {
        query.where.locationId = input.location;
      }

      const orders = await prisma.order.findMany(query);

      return orders;
    }),

  getOrders: protectedProcedure
    .input(
      z.object({
        take: z.number(),
        skip: z.number(),
        location: z.string(),
        sort: z.string(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { skip, take, location, sort, search } = input;

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
          earning: true,
        },
      };

      if (location !== "all" && search) {
        query.where = {
          locationId: location,
          number: Number(search),
        };
      } else {
        if (location !== "all") {
          query.where = { locationId: location };
        }
        if (search) {
          query.where = { number: Number(search) };
        }
      }

      if (sort === ADMIN_ORDERS_SORT["NEXT ORDERS"]) {
        query.orderBy = { book: { start_date: "asc" } };
        query.where = { ...query.where };
        query.where.book = {
          start_date: { gte: dayjs().startOf("day").toDate() },
        };
      }

      if (sort === ADMIN_ORDERS_SORT["LAST ORDERS"]) {
        query.orderBy = { created_at: "desc" };
      }

      if (sort === ADMIN_ORDERS_SORT.HISTORY) {
        query.orderBy = { book: { start_date: "desc" } };
      }

      const orders = await prisma.order.findMany(query);

      const totalCount = await prisma.order.count({
        where: query.where,
      });

      return { orders, totalCount };
    }),

  createOrder: protectedProcedure
    .input(
      z.object({
        discount: z
          .object({
            value: z.number(),
            typeName: z.string(),
            code: z.string(),
          })
          .nullish(),
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
        discount,
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

      if (locationId === "clh6ck61q0002e7dopcv0u9rp") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot books in Mendoza",
        });
      }

      if (email) {
        customer = await prisma.user.findUnique({
          where: { email },
        });

        if (!customer) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wrong customer email, customer does not exist",
          });
        }
      }

      //GET UPDATED CART WITH MOST RECENT BOOKS

      const updatedCart = await getUpdatedCart(cart);

      const sameLocationEquipmentCart = updatedCart.map((item) => ({
        ...item,
        owner: item.owner.filter(
          (ownerOnEquipment) => ownerOnEquipment.locationId === locationId
        ),
      }));

      //CHECK ALL EQUIPMENT AVAILABILITY
      if (
        !sameLocationEquipmentCart.every((item) =>
          isEquipmentAvailable(item, { startDate, endDate })
        )
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Alguno de los equipos no está disponible para la fecha",
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

      const equipmentOnOwnerIds = sameLocationEquipmentCart
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

      // IF DISCOUNT UPDATE DISCOUNT
      let discountModel;
      if (discount) {
        discountModel = await prisma.discount.update({
          where: {
            code: discount.code,
          },
          data: {
            usage_count: {
              increment: 1,
            },
          },
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
            deliver_status: ORDER_DELIVER_STATUS.PENDING,
            return_status: ORDER_RETURN_STATUS.PENDING,
            discount: discountModel
              ? { connect: { id: discountModel?.id } }
              : undefined,
          },
          include: {
            book: true,
            equipments: {
              include: { books: true, owner: true, equipment: true },
            },
            discount: {
              include: {
                rule: {
                  include: {
                    type: true,
                  },
                },
              },
            },
            customer: {
              include: {
                address: true,
              },
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

        console.log(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Create Order failed, please try again later",
        });
      }

      //CALCULATE AND CREATE EARNINGS FOR EACH OWNER

      const earnings = await calcualteAndCreateEarnings(newOrder);

      //SEND MAIL TO CUSTOMER
      if (newOrder.customer.email && newOrder.customer.name) {
        const filteredOrder = {
          ...newOrder,
          equipments: getOrderEquipmentOnOwners(
            newOrder.equipments,
            newOrder.bookId
          ),
        };

        const equipmentList = filteredOrder.equipments.map((equipment) => ({
          item: `${equipment.equipment.name} ${equipment.equipment.brand} ${equipment.equipment.model}`,
          quantity: `${equipment.books.reduce((acc, curr) => {
            return acc + curr.quantity;
          }, 0)}`,
        }));

        const mailData = {
          name: newOrder.customer.name,
          email: newOrder.customer.email,
          phone: newOrder.customer.address?.phone,
          number: newOrder.number,
          startDate: toArgentinaDate(startDate),
          endDate: toArgentinaDate(endDate),
          pickupHour,
          equipmentList,
          total: formatPrice(newOrder.total),
        };

        await sendMail(
          mailData,
          "newOrder.handlebars",
          `NUEVO PEDIDO REALIZADO #${newOrder.number}`
        );

        await sendMailToGuanaco(
          mailData,
          `NUEVO PEDIDO REALIZADO #${newOrder.number}`
        );
      }

      return { newOrder, earnings };
    }),

  setOrderDelivered: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      const { orderId } = input;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          deliver_status: ORDER_DELIVER_STATUS.DELIVERED,
        },
      });

      return { message: "success" };
    }),

  setOrderReturned: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      const { orderId } = input;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          return_status: ORDER_RETURN_STATUS.RETURNED,
        },
      });

      return { message: "success" };
    }),

  deleteOrderById: protectedProcedure
    .input(z.object({ orderId: z.string(), bookId: z.string() }))
    .mutation(async ({ input }) => {
      const { orderId, bookId } = input;

      await prisma.earning.delete({
        where: { orderId },
      });

      const order = await prisma.order.delete({
        where: { id: orderId },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order || !order.customer.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "failed on book delete",
        });
      }
      await sendCancelOrderMail(order.customer.email, order.number);

      await prisma.book.delete({
        where: { id: bookId },
        include: {
          order: {
            select: {
              customer: { select: { name: true, email: true } },
              number: true,
            },
          },
        },
      });

      return { message: "success" };
    }),
});
