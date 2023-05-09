import { createTRPCRouter } from "@/server/api/trpc";
import { categoryRouter } from "./routers/category";
import { locaitonRouter } from "./routers/location";
import { equipmentRouter } from "./routers/equipment";
import { userRouter } from "./routers/user";
import { orderRouter } from "./routers/order";
import { roleRouter } from "./routers/role";
import { discountRouter } from "./routers/discount";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  category: categoryRouter,
  location: locaitonRouter,
  equipment: equipmentRouter,
  user: userRouter,
  order: orderRouter,
  role: roleRouter,
  discount: discountRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
