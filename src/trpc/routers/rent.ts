import { createTRPCRouter, protectedProcedure } from "~/trpc/init";
import { prisma } from "~/utils/db";
import dayjs from "dayjs";
import { z } from "zod";

type EarningQuery = {
  where?: {
    order: {
      book: {
        start_date: { gte: Date; lte: Date };
      };
      locationId?: string;
    };
  };
};

type OrderQuery = {
  where?: {
    locationId?: string;
    book?: {
      start_date: {
        gte: Date;
        lte: Date;
      };
    };
  };
};

export const rentRouter = createTRPCRouter({
  getTotal: protectedProcedure
    .input(z.object({ month: z.string(), year: z.string(), location: z.string() }))
    .query(async ({ input }) => {
      const { month, year, location } = input;

      const orderQuery: OrderQuery = {};
      const earningQuery: EarningQuery = {};

      if (month === "all" && year !== "all") {
        const firstMonthDay = dayjs(`${year}-01`).startOf("month").toDate();
        const lastMonthDay = dayjs(`${year}-12`).endOf("month").toDate();

        orderQuery.where = {
          book: { start_date: { gte: firstMonthDay, lte: lastMonthDay } },
        };
        earningQuery.where = {
          order: {
            book: {
              start_date: { gte: firstMonthDay, lte: lastMonthDay },
            },
          },
        };
      } else if (month !== "all" || year !== "all") {
        const firstMonthDay = dayjs(`${year}-${month}`).startOf("month").toDate();
        const lastMonthDay = dayjs(`${year}-${month}`).endOf("month").toDate();

        orderQuery.where = {
          book: { start_date: { gte: firstMonthDay, lte: lastMonthDay } },
        };
        earningQuery.where = {
          order: {
            book: {
              start_date: { gte: firstMonthDay, lte: lastMonthDay },
            },
          },
        };
      }

      if (location !== "all") {
        orderQuery.where = orderQuery.where ?? {};
        orderQuery.where.locationId = location;

        if (earningQuery.where) {
          earningQuery.where.order.locationId = location;
        }
      }

      const orders = await prisma.order.findMany(orderQuery);

      const totalFromOrders = orders.reduce((acc, curr) => {
        return acc + curr.total;
      }, 0);

      const earnigns = await prisma.earning.findMany(earningQuery);

      const splitFromEarnings = earnigns.reduce(
        (acc, curr) => {
          return {
            federico: acc.federico + curr.federico,
            oscar: acc.oscar + curr.oscar,
            sub: acc.sub + curr.sub,
          };
        },
        { federico: 0, oscar: 0, sub: 0 }
      );

      const totalFromEarnings = earnigns.reduce((acc, curr) => {
        return acc + (curr.federico + curr.oscar + curr.sub);
      }, 0);

      return { totalFromOrders, splitFromEarnings, totalFromEarnings };
    }),
});
