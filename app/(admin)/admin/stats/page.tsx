import { trpc } from "~/trpc/server";
import ClientAdminStatsPage from "./page.client";
import { prisma } from "~/utils/db";
import { LocationName } from "~/lib/constants";
import { Prisma } from "@prisma/client";

type OrderAverage = Prisma.OrderGetPayload<{
  include: {
    book: true;
  };
}>;
const calculateAverage = (orders: { subtotal: number; total: number }[]) => {
  let subtotalSum = 0;
  orders.forEach((order) => {
    subtotalSum += order.subtotal;
  });

  return Number((subtotalSum / orders.length).toFixed(2));
};

export default async function AdminStatsPage() {
  const locations = await trpc.location.getAllLocations();
  const categories = await trpc.category.getAllCategories();

  await trpc.stats.getTopBookedEquipments.prefetch({});
  await trpc.stats.getTopCategoryOrders.prefetch({});

  const ordersForAverage = await prisma.order.findMany({
    select: {
      total: true,
      subtotal: true,
    },
  });

  const calculateAverageByMonth = (orders: OrderAverage[]) => {
    const ordersByMonth: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
    };

    orders.forEach((order) => {
      const month = new Date(order.book.start_date).getMonth();

      ordersByMonth[month] ? ordersByMonth[month]++ : (ordersByMonth[month] = 1);
    });

    const sum = Object.values(ordersByMonth).reduce((a, b) => a + b, 0);
    const avg = (sum / Object.keys(ordersByMonth).length).toFixed(2);

    return { ordersByMonth, avg };
  };

  const totalOrders = await prisma.order.findMany({
    include: {
      book: true,
    },
  });

  const sjOrders = await prisma.order.findMany({
    where: {
      locationId: locations.find((l) => l.name === LocationName.SAN_JUAN)?.id,
    },
    include: {
      book: true,
    },
  });

  const slOrders = await prisma.order.findMany({
    where: {
      locationId: locations.find((l) => l.name === LocationName.SAN_LUIS)?.id,
    },
    include: {
      book: true,
    },
  });

  const monthAverage = calculateAverageByMonth(totalOrders);
  const sjMonthAverage = calculateAverageByMonth(sjOrders);
  const slMonthAverage = calculateAverageByMonth(slOrders);

  return (
    <ClientAdminStatsPage
      locations={locations}
      categories={categories}
      average={{ subtotalAverage: calculateAverage(ordersForAverage) }}
      monthAverage={{
        ordersByMonth: monthAverage.ordersByMonth,
        sjOrdersByMonth: sjMonthAverage.ordersByMonth,
        slOrdersByMonth: slMonthAverage.ordersByMonth,
        avg: monthAverage.avg,
      }}
    />
  );
}
