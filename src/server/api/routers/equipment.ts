import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const SORT_TYPES = {
  DEFAULT: "default",
  DESC: "desc",
  ASC: "asc",
};

type WherePipe = {
  categoryId?: string;
  locationId?: string;
};

export const equipmentRouter = createTRPCRouter({
  getAllEquipment: publicProcedure
    .input(
      z.object({
        sort: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const sortPipe: Array<object> = [];
      const wherePipe: WherePipe = {};

      if (input.sort === SORT_TYPES.DESC) {
        sortPipe.push({ price: "desc" });
      }

      if (input.sort === SORT_TYPES.ASC) {
        sortPipe.push({ price: "asc" });
      }

      if (input.category) {
        wherePipe.categoryId = input.category;
      }

      if (input.location) {
        wherePipe.locationId = input.location;
      }

      const equipment = await prisma.equipment.findMany({
        where: wherePipe,
        orderBy: sortPipe,
      });

      return equipment;
    }),
});
