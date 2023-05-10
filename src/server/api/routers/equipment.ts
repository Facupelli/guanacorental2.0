import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { SORT_TYPES } from "@/lib/magic_strings";

type WherePipe = {
  available?: boolean;
  categoryId?: string;
  owner?: { some: { location: { id: string } } };
  OR?: [
    {
      name: {
        search: string;
      };
    },
    {
      brand: {
        search: string;
      };
    },
    {
      model: {
        search: string;
      };
    }
  ];
};

export const equipmentRouter = createTRPCRouter({
  putEquipment: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        brand: z.string(),
        model: z.string(),
        image: z.string(),
        price: z.number(),
        equipmentId: z.string(),
        available: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, brand, model, image, price, equipmentId, available } =
        input;

      await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          price,
          image,
          name,
          brand,
          model,
          available: available === "on" ? true : false,
        },
      });

      return { message: "success" };
    }),

  createEquipmentOnOwner: protectedProcedure
    .input(
      z.object({
        owner: z.array(
          z.object({
            equipmentId: z.string(),
            ownerId: z.string(),
            locationId: z.string(),
            stock: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { owner } = input;

      if (owner[0]) {
        await prisma.$transaction(
          owner.map((owner) => {
            return prisma.equipmentOnOwner.create({
              data: {
                equipmentId: owner.equipmentId,
                ownerId: owner.ownerId,
                locationId: owner.locationId,
                stock: owner.stock,
              },
            });
          })
        );

        return { message: "success" };
      }
      return { message: "owner missing" };
    }),

  adminGetEquipment: protectedProcedure
    .input(
      z.object({
        locationId: z.string().optional(),
        take: z.number(),
        skip: z.number(),
      })
    )
    .query(async ({ input }) => {
      const equipment = await prisma.equipment.findMany({
        take: input.take,
        skip: input.skip,
        include: {
          owner: { include: { owner: true, location: true } },
          category:true
        },
      });

      const totalCount = await prisma.equipment.count();

      return { equipment, totalCount };
    }),

  getAllEquipment: publicProcedure
    .input(
      z.object({
        sort: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        search: z.string().optional(),
        cursor: z.string().nullish(),
        limit: z.number(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, skip, cursor } = input;

      const sortPipe: Array<object> = [];
      const wherePipe: WherePipe = {};

      wherePipe.available = true;

      if (input.sort === SORT_TYPES.DESC) {
        sortPipe.push({ price: "desc" });
      }

      if (input.sort === SORT_TYPES.ASC) {
        sortPipe.push({ price: "asc" });
      }

      if (input.category) {
        wherePipe.categoryId = input.category;
      }

      if (input.location) {
        wherePipe.owner = { some: { location: { id: input.location } } };
      }

      if (input.search) {
        wherePipe.OR = [
          { name: { search: input.search } },
          { brand: { search: input.search } },
          { model: { search: input.search } },
        ];
      }

      const equipments = await prisma.equipment.findMany({
        take: limit + 1,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: wherePipe,
        orderBy: sortPipe,
        include: {
          owner: {
            include: {
              owner: true,
              location: true,
              books: { include: { book: true } },
            },
          },
        },
      });

      let nextCursor: undefined | typeof cursor = undefined;
      if (equipments.length > limit) {
        const nextItem = equipments.pop();
        nextCursor = nextItem?.id;
      }

      return { equipments, nextCursor };
    }),
});
