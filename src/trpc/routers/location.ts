import { createTRPCRouter, publicProcedure } from "~/trpc/init";
import { prisma } from "~/utils/db";

export const locationRouter = createTRPCRouter({
  getAllLocations: publicProcedure.query(async () => {
    const locations = await prisma.location.findMany({});

    return locations;
  }),
});
