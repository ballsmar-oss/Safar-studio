import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { createServer } from "http";
import { registerAdminRoutes } from "../auth";
import { openDb, runMigrations } from "../db";
import { ENV } from "../env";
import { appRouter } from "../routers";
import { seedIfEmpty } from "../seed";
import { registerMoyasarWebhook } from "../moyasar-webhook";
import { registerUploads } from "../uploads";
import { registerVisitRoute } from "../visits";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  await openDb();
  runMigrations();
  seedIfEmpty();

  const app = express();
  const server = createServer(app);
  app.set("trust proxy", "loopback"); // Caddy runs in front on the same server
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app.use(express.json({ limit: "2mb" }));

  registerUploads(app);
  registerVisitRoute(app);
  registerAdminRoutes(app);
  registerMoyasarWebhook(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (ENV.isProduction) serveStatic(app);
  else await setupVite(app, server);

  server.listen(ENV.port, () => {
    console.log(`Server running on http://localhost:${ENV.port}/`);
  });
}

process.on("unhandledRejection", (reason) => console.error("[unhandled]", reason));
process.on("uncaughtException", (error) => console.error("[uncaught]", error));

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
