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
        startsAt: z.date().nullish(),
        usageLimit: z.number().nullish(),
        locationIds: z.array(z.string()),
        typeId: z.string(),
        value: z.number(),
        description: z.string().nullish(),
        minTotal: z.number().nullish(),
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
        minTotal,
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
          min_total: minTotal,
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

    const types = await prisma.discountType.findMany();

    return { discounts, types };
  }),

  getValidDiscountByCode: protectedProcedure
    .input(
      z.object({ code: z.string(), location: z.string(), total: z.number() })
    )
    .mutation(async ({ input }) => {
      const { code, location, total } = input;

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

      if (discount.min_total && total <= discount.min_total) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `El cupón tiene un mínimo de ${discount.min_total}`,
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
