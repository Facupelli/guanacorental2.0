import { equipmentRouter } from "./equipment";
import { locationRouter } from "./location";
import { categoryRouter } from "./category";
import { orderRouter } from "./order";
import { userRouter } from "./user";
import { discountRouter } from "./discount";
import { ownerRouter } from "./owner";
import { rentRouter } from "./rent";
import { roleRouter } from "./role";
import { statsRouter } from "./stats";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  equipment: equipmentRouter,
  location: locationRouter,
  category: categoryRouter,
  order: orderRouter,
  user: userRouter,
  discount: discountRouter,
  owner: ownerRouter,
  rent: rentRouter,
  role: roleRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
