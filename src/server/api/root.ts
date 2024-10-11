import { createTRPCRouter } from "@/server/api/trpc";
import { categoryRouter } from "../../../server/routers/category";
import { equipmentRouter } from "./routers/equipment";
import { userRouter } from "./routers/user";
import { orderRouter } from "./routers/order";
import { roleRouter } from "./routers/role";
import { discountRouter } from "./routers/discount";
import { ownerRouter } from "./routers/owner";
import { rentRouter } from "./routers/rent";
import { statsRouter } from "./routers/stats";
import { locationRouter } from "server/routers/location";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  category: categoryRouter,
  location: locationRouter,
  equipment: equipmentRouter,
  user: userRouter,
  order: orderRouter,
  role: roleRouter,
  discount: discountRouter,
  owner: ownerRouter,
  rent: rentRouter,
  stats: statsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
