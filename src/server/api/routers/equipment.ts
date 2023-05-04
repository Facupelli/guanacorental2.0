import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { SORT_TYPES } from "@/lib/magic_strings";

type WherePipe = {
  categoryId?: string;
  owner?: { some: { location: { id: string } } };
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
        wherePipe.owner = { some: { location: { id: input.location } } };
      }

      const equipments = await prisma.equipment.findMany({
        take: limit + 1,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: wherePipe,
        orderBy: sortPipe,
        include: {
          owner: { include: { owner: true, location: true } },
        },
      });

      // const equipments = await prisma.equipmentOnOwner.findMany({
      //   where: {
      //     locationId:""
      //   },
      //   distinct: ["locationId"],
      //   include:{
      //     equipment:true
      //   }
      // });

      let nextCursor: undefined | typeof cursor = undefined;
      if (equipments.length > limit) {
        const nextItem = equipments.pop();
        nextCursor = nextItem?.id;
      }

      return { equipments, nextCursor };
    }),
});
