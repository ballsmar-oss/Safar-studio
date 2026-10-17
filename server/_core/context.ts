import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { AdminDevice } from "../../drizzle/schema";
import { getAdminDevice } from "../auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  device: AdminDevice | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  return { req: opts.req, res: opts.res, device: getAdminDevice(opts.req) };
}
