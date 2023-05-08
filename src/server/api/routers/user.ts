import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { validationAddress } from "@/lib/validation";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  editUser: protectedProcedure
    .input(z.object({ userId: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      const { userId, name } = input;

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
        },
      });

      return { message: "success" };
    }),

  getUserById: protectedProcedure
    .input(z.object({ userId: z.string(), take: z.number(), skip: z.number() }))
    .query(async ({ input }) => {
      const { userId, take, skip } = input;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: {
            take,
            skip,
            include: {
              book: true,
              equipments: {
                include: { books: true, owner: true, equipment: true },
              },
              customer: {
                include: {
                  address: true,
                },
              },
              location: true,
            },
          },
          address: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }

      const totalUserOrders = await prisma.order.count({
        where: {
          customerId: user.id,
        },
      });

      return { user, totalUserOrders };
    }),

  getAllUsers: protectedProcedure
    .input(
      z.object({
        take: z.number(),
        skip: z.number(),
        roleId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { take, skip, roleId } = input;

      const users = await prisma.user.findMany({
        where: {
          role: {
            some: {
              id: roleId,
            },
          },
        },
        take,
        skip,
        include: {
          role: true,
          address: true,
          orders: true,
        },
      });

      const totalCount = await prisma.user.count();

      return { users, totalCount };
    }),

  createUserAddress: protectedProcedure
    .input(validationAddress.extend({ userId: z.string().nonempty() }))
    .mutation(async ({ input }) => {
      const address = await prisma.address.create({
        data: {
          full_name: input.full_name,
          phone: input.phone,
          province: input.province,
          city: input.city,
          address_1: input.address_1,
          dni_number: input.dni_number,
          birth_date: input.birth_date,
          occupation: input.occupation,
          company: input.company,
          student: input.student,
          employee: input.employee,
          cuit: input.cuit,
          bussines_name: input.bussiness_name,
          bank: input.bank,
          alias: input.bank,
          cbu: input.cbu,
          contact_1: input.contact_1,
          bond_1: input.bond_1,
          contact_2: input.contact_2,
          bond_2: input.bond_2,
        },
      });

      const customerRole = await prisma.role.findFirst({
        where: { name: "Customer" },
      });

      if (!customerRole) return;

      await prisma.user.update({
        where: { id: input.userId },
        data: {
          address: { connect: { id: address.id } },
          role: { connect: { id: customerRole.id } },
        },
      });

      return { message: "success" };
    }),
});
