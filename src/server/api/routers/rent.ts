import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";
import dayjs from "dayjs";
import { z } from "zod";

type EarningQuery = {
  where?: {
    order: {
      book: {
        start_date: { gte: Date; lte: Date };
      };
    };
  };
};

type OrderQuery = {
  where?: WherePipe;
};

type WherePipe = {
  book?: {
    start_date: {
      gte: Date;
      lte: Date;
    };
  };
};

export const rentRouter = createTRPCRouter({
  getTotal: protectedProcedure
    .input(z.object({ month: z.string(), year: z.string() }))
    .query(async ({ input }) => {
      const { month, year } = input;

      const orderQuery: OrderQuery = {};
      const earningQuery: EarningQuery = {};

      if (month !== "all" || year !== "all") {
        const firstMonthDay = dayjs(`${year}-${month}`)
          .startOf("month")
          .toDate();
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
