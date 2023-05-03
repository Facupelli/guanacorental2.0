import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { validationAddress } from "@/lib/validation";
import { z } from "zod";

export const userRouter = createTRPCRouter({
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
