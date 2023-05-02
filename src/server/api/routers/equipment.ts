import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const equipmentRouter = createTRPCRouter({
  getAllEquipment: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(async () => {
      const equipment = await prisma.equipment.findMany({});

      return equipment;
    }),
});
