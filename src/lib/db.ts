import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    // Log the DATABASE_URL for debugging (without sensitive info)
    const dbUrlParts = process.env.DATABASE_URL?.split("@") || [];
    console.log(
      "Using database URL with host:",
      dbUrlParts.length > 1 ? dbUrlParts[1] : "unknown"
    );

    global.cachedPrisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }

  prisma = global.cachedPrisma;
}

export const db = prisma;
