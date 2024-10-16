import { createTRPCRouter, protectedProcedure } from "~/trpc/init";
import { prisma } from "~/utils/db";
import { validationAddress } from "~/lib/validation";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendMail } from "~/utils/mailer";

export const userRouter = createTRPCRouter({
  getPetitionUsers: protectedProcedure.query(async () => {
    const users = await prisma.user.findMany({
      where: {
        petition_sent: true,
        customer_approved: false,
      },
      include: {
        address: true,
      },
    });

    return users;
  }),

  editUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        fullName: z.string(),
        company: z.string(),
        phone: z.string(),
        province: z.string(),
        city: z.string(),
        address_1: z.string(),
        dni_number: z.string(),
        occupation: z.string(),
        cuit: z.string(),
        bussinessName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        userId,
        fullName,
        company,
        phone,
        province,
        city,
        address_1,
        dni_number,
        occupation,
        cuit,
        bussinessName,
      } = input;

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: fullName,
        },
      });

      if (user && user.addressId) {
        await prisma.address.update({
          where: { id: user.addressId },
          data: {
            company,
            phone,
            province,
            city,
            address_1,
            dni_number,
            occupation,
            cuit,
            bussines_name: bussinessName,
          },
        });
      }

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
              earning: true,
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
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { take, skip, roleId, search } = input;

      type wherePipe = {
        role?: {
          some: {
            id: string;
          };
        };
        petition_sent: boolean;
        customer_approved: boolean;
        name?: { contains: string; mode: "insensitive" };
      };

      const wherePipe: wherePipe = {
        petition_sent: true,
        customer_approved: true,
      };

      if (roleId) {
        wherePipe.role = { some: { id: roleId } };
      }

      if (search) {
        wherePipe.name = { contains: search, mode: "insensitive" };
      }

      const users = await prisma.user.findMany({
        where: wherePipe,
        take,
        skip,
        include: {
          role: true,
          address: true,
          orders: true,
        },
      });

      const totalCount = await prisma.user.count({
        where: wherePipe,
      });

      return { users, totalCount };
    }),

  createUserAddress: protectedProcedure
    .input(
      validationAddress.extend({
        userId: z.string().nonempty(),
        dniBack: z.string(),
        dniFront: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      let newUser;

      if (input.email) {
        newUser = await prisma.user.create({
          data: {
            email: input.email,
            name: input.full_name,
          },
        });
      }

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
          alias: input.alias,
          cbu: input.cbu,
          contact_1: input.contact_1,
          bond_1: input.bond_1,
          contact_2: input.contact_2,
          bond_2: input.bond_2,
          dni_back: input.dniBack,
          dni_front: input.dniFront,
        },
      });

      const customerRole = await prisma.role.findFirst({
        where: { name: "Customer" },
      });

      if (!customerRole) return;

      await prisma.user.update({
        where: { id: newUser ? newUser.id : input.userId },
        data: {
          address: { connect: { id: address.id } },
          role: { connect: { id: customerRole.id } },
          petition_sent: true,
        },
      });

      return { message: "success" };
    }),

  approveUser: protectedProcedure
    .input(z.object({ userId: z.string(), customerApproved: z.boolean() }))
    .mutation(async ({ input }) => {
      const { userId, customerApproved } = input;

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          customer_approved: customerApproved,
        },
      });

      if (user && user.email && customerApproved) {
        await sendMail({ email: user.email }, "customerApproved.handlebars", "ALTA DE CLIENTE");
      }

      return { message: "success", user };
    }),
});
