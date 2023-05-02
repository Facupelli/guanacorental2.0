import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const categoryRouter = createTRPCRouter({
  getAllCategories: publicProcedure.query(async () => {
    const categories = await prisma.category.findMany({});

    return categories;
  }),
});
