import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: process.env.NODE_ENV === "production" ? 5 : 100, // Limit each IP to 5 requests per `window` (here, per 10 minutes) and 100 for development
  message: {
    error: "Too many requests from this IP, please try again after 10 minutes.",
  },
});
