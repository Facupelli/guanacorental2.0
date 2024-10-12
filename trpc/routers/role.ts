import { createTRPCRouter, protectedProcedure, publicProcedure } from "trpc/init";
import { prisma } from "@/server/db";
import { z } from "zod";

export const roleRouter = createTRPCRouter({
  getAllRoles: publicProcedure.query(async () => {
    const roles = await prisma.role.findMany({});

    return roles;
  }),

  assignRoleToUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, roleId } = input;

      await prisma.user.update({
        where: { id: userId },
        data: {
          role: { connect: { id: roleId } },
        },
      });

      return { message: "success" };
    }),

  removeRoleFromUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, roleId } = input;

      await prisma.user.update({
        where: { id: userId },
        data: {
          role: { disconnect: { id: roleId } },
        },
      });

      return { message: "success" };
    }),
});
