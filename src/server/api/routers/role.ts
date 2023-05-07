import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const roleRouter = createTRPCRouter({
  getAllRoles: publicProcedure.query(async () => {
    const roles = await prisma.role.findMany({});

    return roles;
  }),
});
