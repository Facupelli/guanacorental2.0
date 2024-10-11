import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const locationRouter = createTRPCRouter({
  getAllLocations: publicProcedure.query(async () => {
    const locations = await prisma.location.findMany({});

    return locations;
  }),
});
