import { PrismaClientKnownRequestError, PrismaClientInitializationError } from "@prisma/client/runtime/library";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

type RetryOptions = {
  maxRetries?: number;
  initialDelay?: number;
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const initialDelay = options.initialDelay ?? INITIAL_RETRY_DELAY;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if the error is retryable
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientInitializationError
      ) {
        const isRetryable =
          error.message.includes("Connection pool") ||
          error.message.includes("I/O error") ||
          error.message.includes("RetryableWriteError") ||
          error.message.includes("request timed out") ||
          error.message.includes("Connection reset") ||
          error.message.includes("closed by the remote host");

        if (!isRetryable) {
          console.error(`Non-retryable database error:`, error);
          throw error;
        }
      } else {
        // Non-Prisma error, don't retry
        console.error(`Non-Prisma error:`, error);
        throw error;
      }

      if (attempt === maxRetries) {
        console.error(`Operation failed after ${maxRetries} attempts:`, error);
        throw error;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(
        `Database operation attempt ${attempt} failed. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Operation failed");
}
