import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";
import dayjs from "dayjs";
import { z } from "zod";

export const rentRouter = createTRPCRouter({
  getTotal: protectedProcedure
    .input(z.object({ month: z.date().optional() }))
    .query(async ({ input }) => {
      const { month } = input;

      const firstMonthDay = dayjs("2023-05").startOf("month").toDate();
      const lastMonthDay = dayjs("2023-05").endOf("month").toDate();

      const orders = await prisma.order.findMany({
        where: {
          book: {
            start_date: { gte: firstMonthDay, lte: lastMonthDay },
          },
        },
      });

      const totalFromOrders = orders.reduce((acc, curr) => {
        return acc + curr.total;
      }, 0);

      const earnigns = await prisma.earning.findMany({
        where: {
          order: {
            book: {
              start_date: { gte: firstMonthDay, lte: lastMonthDay },
            },
          },
        },
      });

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
