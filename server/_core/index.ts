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
  app.use(express.json({ limit: "2mb" }));

  registerUploads(app);
  registerAdminRoutes(app);
  registerMoyasarWebhook(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (ENV.isProduction) serveStatic(app);
  else await setupVite(app, server);

  server.listen(ENV.port, () => {
    console.log(`Server running on http://localhost:${ENV.port}/`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
