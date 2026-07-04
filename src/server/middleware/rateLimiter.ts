import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Only instantiate Redis if the URL is explicitly provided
export const redisClient = REDIS_URL ? new Redis(REDIS_URL, {
  retryStrategy(times) {
    if (times > 3) {
      console.warn("[ioredis] Maximum connection retries reached. Stopping retry.");
      return null; // Stop retrying
    }
    return Math.min(times * 100, 2000);
  }
}) : null;

if (redisClient) {
  redisClient.on("error", (err) => {
    // Suppress verbose stack traces and just log a warning
    console.warn("[ioredis] Connection error:", err.message);
  });
}

// Helper to create a new store instance with a specific prefix
const createStore = (prefix: string) => {
  if (!redisClient) return undefined;
  return new RedisStore({
    // @ts-ignore - type mismatch between ioredis and rate-limit-redis
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: prefix,
  });
};

// Standard API rate limiter
export const apiLimiter = rateLimit({
  store: createStore("rl:api:"),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for sensitive routes (e.g. login, sign up, billing)
export const strictLimiter = rateLimit({
  store: createStore("rl:strict:"),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: { error: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
