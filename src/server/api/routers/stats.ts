import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { type Prisma } from "@prisma/client";
import { z } from "zod";

export type TopBookedEquipment = Prisma.EquipmentGetPayload<{
  select: {
    name: true;
    model: true;
    owner: {
      include: {
        orders: {
          include: {
            book: true;
          };
        };
        location: true;
      };
    };
  };
}>;

export type BookedEquipment = Prisma.EquipmentGetPayload<{
  include: {
    owner: {
      include: {
        orders: true;
        location: true;
      };
    };
  };
}>;

const getTopE = (equipments: TopBookedEquipment[], take?: number) => {
  const sortedE = equipments.sort((a, b) => {
    const aTotal = a.owner.reduce((acc, cur) => acc + cur.orders.length, 0);
    const bTotal = b.owner.reduce((acc, cur) => acc + cur.orders.length, 0);

    return bTotal - aTotal;
  });
  const topE = take === 0 ? sortedE : sortedE.slice(0, take);

  return topE;
};

export const statsRouter = createTRPCRouter({
  getTopBookedEquipments: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        take: z.number().optional(),
        location: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { category, take } = input;

      const equipments = await prisma.equipment.findMany({
        where: {
          categoryId: category === "all" ? undefined : category,
        },
        select: {
          name: true,
          model: true,
          owner: {
            include: {
              orders: {
                include: {
                  book: true,
                },
              },
              location: true,
            },
          },
        },
      });

      const totalTopBookedEquipments = getTopE(equipments, take);
      return totalTopBookedEquipments;
    }),

  getEquipmentBookedStat: protectedProcedure
    .input(
      z.object({
        equipmentId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { equipmentId } = input;

      const equipments = await prisma.equipment.findMany({
        where: {
          id: equipmentId,
        },
        include: {
          owner: {
            include: {
              orders: true,
              location: true,
            },
          },
        },
      });

      return equipments;
    }),

  getTopCategoryOrders: protectedProcedure
    .input(z.object({ location: z.string().optional() }))
    .query(async ({ input }) => {
      const { location } = input;

      const ordersWithCategories = await prisma.order.findMany({
        where: {
          locationId: location === "all" ? undefined : location,
        },
        include: {
          equipments: {
            include: {
              equipment: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      const categoryOrders = ordersWithCategories.map((order) => ({
        total: order.total,
        categories: order.equipments.map(
          (equipment) => equipment.equipment.category.name
        ),
      }));

      return categoryOrders;
    }),
});
