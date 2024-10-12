import { createTRPCRouter, publicProcedure } from "trpc/init";
import { prisma } from "@/server/db";

export const ownerRouter = createTRPCRouter({
  getOwners: publicProcedure.query(async () => {
    const owners = await prisma.owner.findMany({});

    return owners;
  }),
});
