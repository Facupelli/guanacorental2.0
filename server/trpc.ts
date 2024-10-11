import { authOptions } from "@/server/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { equipmentRouter } from "./routers/equipment";
import { locationRouter } from "./routers/location";
import { categoryRouter } from "./routers/category";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(async ({ next }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

export const appRouter = router({
  equipment: equipmentRouter,
  location: locationRouter,
  category: categoryRouter,
  // Add other routers here
});

export type AppRouter = typeof appRouter;
