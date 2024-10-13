import { PrismaClient } from "@prisma/client";

import { env } from "env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (typeof window === "undefined") {
  // This block runs only on the server
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error"],
      // env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

  if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };
