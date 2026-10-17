import { defineConfig } from "drizzle-kit";

// Generates SQL migrations into drizzle/migrations; the server applies them on start.
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
});
