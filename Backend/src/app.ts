import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { auctionsRouter } from "./routes/auctions";
import { bidsRouter } from "./routes/bids";
import { errorHandler, notFound } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.use("/api", healthRouter);
  app.use("/api", authRouter);
  app.use("/api", usersRouter);
  app.use("/api", auctionsRouter);
  app.use("/api", bidsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
