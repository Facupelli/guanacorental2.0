import { createTRPCRouter, publicProcedure } from "trpc/init";
import { prisma } from "@/server/db";

export const categoryRouter = createTRPCRouter({
  getAllCategories: publicProcedure.query(async () => {
    const categories = await prisma.category.findMany({});

    return categories;
  }),
});
