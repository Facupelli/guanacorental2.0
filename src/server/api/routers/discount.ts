import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { z } from "zod";

export const discountRouter = createTRPCRouter({
  createDiscount: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        endsAt: z.date().nullish(),
        startsAt: z.date(),
        locationIds: z.array(z.string()),
        usageLimit: z.number().nullish(),
        typeId: z.string(),
        value: z.number(),
        description: z.string().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        code,
        endsAt,
        startsAt,
        locationIds,
        usageLimit,
        typeId,
        value,
        description,
      } = input;

      const location = locationIds.map((id) => ({ id }));

      const rule = await prisma.discountRule.create({
        data: {
          type: { connect: { id: typeId } },
          value,
          description,
        },
      });

      const discount = await prisma.discount.create({
        data: {
          code,
          ends_at: endsAt,
          starts_at: startsAt,
          is_disabled: false,
          location: { connect: location },
          usage_count: 0,
          usage_limit: usageLimit,
          rule: { connect: { id: rule.id } },
        },
      });

      return discount;
    }),

  getAllDiscounts: protectedProcedure.query(async () => {
    const discounts = await prisma.discount.findMany({
      include: {
        rule: {
          include: {
            type: true,
          },
        },
        location: true,
      },
    });

    return discounts;
  }),

  getValidDiscountByCode: protectedProcedure
    .input(z.object({ code: z.string(), location: z.string() }))
    .mutation(async ({ input }) => {
      const { code, location } = input;

      const discount = await prisma.discount.findUnique({
        where: { code },
        include: {
          location: true,
          rule: {
            include: {
              type: true,
            },
          },
        },
      });

      if (!discount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El cupón no existe",
        });
      }

      if (
        !discount?.location.map((location) => location.id).includes(location)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El cupón no es aplicabale a esta sucursal",
        });
      }

      if (dayjs().isBefore(dayjs(discount?.starts_at))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La promoción todavia no empieza",
        });
      }

      if (dayjs().isAfter(dayjs(discount?.ends_at))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El cupón ya venció",
        });
      }

      if (discount?.usage_limit) {
        if (discount?.usage_count >= discount?.usage_limit) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ya se usó la cantidad de cupones lanzados",
          });
        }
      }

      return discount;
    }),
});
