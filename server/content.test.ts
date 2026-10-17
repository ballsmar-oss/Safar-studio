import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("content management permissions", () => {
  it("blocks the admin dashboard for anonymous users", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks the admin dashboard for regular users", async () => {
    const user: AuthenticatedUser = {
      id: 2, openId: "regular-user", email: "user@example.com", name: "Regular User", loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(createContext(user));
    await expect(caller.admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks integration settings for regular users", async () => {
    const user: AuthenticatedUser = {
      id: 4, openId: "settings-user", email: "settings@example.com", name: "Settings User", loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(createContext(user));
    await expect(caller.admin.integrationSettings()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("accepts the approved owner email as an admin", async () => {
    const user: AuthenticatedUser = {
      id: 3, openId: "approved-owner", email: "ballsmar@gmail.com", name: "Owner", loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(createContext(user));
    await expect(caller.admin.dashboard()).resolves.toHaveProperty("portfolio");
  });

  it("returns the public content shape without authentication", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.publicContent.all();
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("portfolio");
    expect(result).toHaveProperty("testimonials");
    expect(result).toHaveProperty("settings");
    expect(result.settings).toHaveProperty("whatsappNumber");
    expect(result.settings).toHaveProperty("instagramUrl");
    expect(result.settings).toHaveProperty("linkedinUrl");
    expect(result.settings).toHaveProperty("tiktokUrl");
    expect(Array.isArray(result.content)).toBe(true);
    expect(Array.isArray(result.portfolio)).toBe(true);
    expect(Array.isArray(result.testimonials)).toBe(true);
  });
});
