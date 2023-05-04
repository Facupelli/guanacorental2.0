import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { SORT_TYPES } from "@/lib/magic_strings";

type WherePipe = {
  categoryId?: string;
  location: { name?: string };
};

export const equipmentRouter = createTRPCRouter({
  getAllEquipment: publicProcedure
    .input(
      z.object({
        sort: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        cursor: z.string().nullish(),
        limit: z.number(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, skip, cursor } = input;

      const sortPipe: Array<object> = [];
      const wherePipe: WherePipe = { location: {} };

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
        wherePipe.location.name = input.location;
      }

      const equipments = await prisma.equipment.findMany({
        take: limit + 1,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: wherePipe,
        orderBy: sortPipe,
        include: {
          location: true,
          owner: { include: { owner: true } },
        },
      });

      let nextCursor: undefined | typeof cursor = undefined;
      if (equipments.length > limit) {
        const nextItem = equipments.pop();
        nextCursor = nextItem?.id;
      }

      return { equipments, nextCursor };
    }),
});
