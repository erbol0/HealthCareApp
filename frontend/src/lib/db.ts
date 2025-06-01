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

// Check if we're on the server side
if (typeof window === "undefined") {
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
      global.cachedPrisma = new PrismaClient({
        log: ["query", "error", "warn"],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        errorFormat: "minimal",
      });
    }
    prisma = global.cachedPrisma;
  }
} else {
  // Return a mock client when in the browser
  prisma = {} as PrismaClient;
}

export const db = prisma;
