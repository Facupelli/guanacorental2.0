import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { SORT_TYPES } from "@/lib/magic_strings";
import { TRPCError } from "@trpc/server";

type WherePipe = {
  deleted: boolean;
  available?: boolean;
  categoryId?: string;
  owner?: {
    some?: { location: { id: string } };
    none?: { location: { id: { not: undefined } } };
  };
  OR?: [
    {
      name: {
        contains: string;
        mode: "insensitive";
      };
    },
    {
      brand: {
        contains: string;
        mode: "insensitive";
      };
    },
    {
      model: {
        contains: string;
        mode: "insensitive";
      };
    }
  ];
};

export const equipmentRouter = createTRPCRouter({
  createEquipment: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        brand: z.string(),
        model: z.string(),
        image: z.string(),
        price: z.number(),
        categoryId: z.string(),
        accessories: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { name, brand, model, image, categoryId, accessories, price } =
        input;

      const newEquipment = await prisma.equipment.create({
        data: {
          name,
          brand,
          model,
          image,
          price,
          category: { connect: { id: categoryId } },
          accessories,
        },
      });

      return newEquipment;
    }),

  putAvailability: protectedProcedure
    .input(z.object({ availability: z.boolean(), equipmentId: z.string() }))
    .mutation(async ({ input }) => {
      const { availability, equipmentId } = input;

      await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          available: availability,
        },
      });

      return { message: "success" };
    }),

  putEquipment: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        brand: z.string(),
        model: z.string(),
        image: z.string(),
        price: z.number(),
        equipmentId: z.string(),
        categoryId: z.string(),
        accessories: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const {
        name,
        brand,
        model,
        image,
        price,
        equipmentId,
        categoryId,
        accessories,
      } = input;

      await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          price,
          image,
          name,
          brand,
          model,
          accessories,
          category: { connect: { id: categoryId } },
          // available: available === "on" ? true : false,
        },
      });

      return { message: "success" };
    }),

  deleteEquipmentOnOwner: protectedProcedure
    .input(z.object({ ownerId: z.string() }))
    .mutation(async ({ input }) => {
      const { ownerId } = input;

      if (!ownerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "missin ownerId" });
      }

      await prisma.equipmentOnOwner.delete({
        where: { id: ownerId },
      });

      return { message: "success" };
    }),

  deleteEquipment: protectedProcedure
    .input(z.object({ equipmentId: z.string() }))
    .mutation(async ({ input }) => {
      const { equipmentId } = input;

      const equipment = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          deleted: true,
        },
      });

      return { message: "success", equipment };
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
        search: z.string().optional(),
        locationId: z.string().optional(),
        categoryId: z.string().optional(),
        take: z.number(),
        skip: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { search, locationId, categoryId, take, skip } = input;

      const wherePipe: WherePipe = { deleted: false };

      if (search) {
        wherePipe.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
        ];
      }

      if (locationId && locationId !== "all") {
        if (locationId === "none") {
          wherePipe.owner = { none: { location: { id: { not: undefined } } } };
        } else {
          wherePipe.owner = { some: { location: { id: locationId } } };
        }
      }

      if (categoryId && categoryId !== "all") {
        wherePipe.categoryId = categoryId;
      }

      const equipment = await prisma.equipment.findMany({
        where: wherePipe,
        take,
        skip,
        include: {
          owner: { include: { owner: true, location: true } },
          category: true,
        },
      });

      const totalCount = await prisma.equipment.count({
        where: wherePipe,
      });

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
      const wherePipe: WherePipe = { deleted: false };

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
          { name: { contains: input.search, mode: "insensitive" } },
          { brand: { contains: input.search, mode: "insensitive" } },
          { model: { contains: input.search, mode: "insensitive" } },
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
