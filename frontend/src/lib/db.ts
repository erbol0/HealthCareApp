import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function createPrismaClient(): Promise<PrismaClient> {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["warn", "error"]
        : ["query", "error", "warn"],
    errorFormat: "minimal",
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Test the connection and implement retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Test the connection by running a simple query
      await client.$connect();
      console.log("Successfully connected to the database");
      return client;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error);

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to connect to database after ${MAX_RETRIES} attempts`
        );
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * attempt)
      );
    }
  }

  return client;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: "minimal",
  });
} else {
  if (!global.cachedPrisma) {
    // Log the DATABASE_URL for debugging (without sensitive info)
    const dbUrlParts = process.env.DATABASE_URL?.split("@") || [];
    console.log(
      "Using database URL with host:",
      dbUrlParts.length > 1 ? dbUrlParts[1] : "unknown"
    );

    createPrismaClient()
      .then((client) => {
        global.cachedPrisma = client;
      })
      .catch((error) => {
        console.error("Failed to initialize Prisma client:", error);
        process.exit(1); // Exit if we can't connect to the database
      });
  }

  prisma = global.cachedPrisma;
}

export const db = prisma;
