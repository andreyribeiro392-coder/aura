import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    userId: 1,
    displayName: "Test User",
    fitnessGoal: "build_muscle",
    fitnessLevel: "Intermediate",
    weightKg: 80,
    heightCm: 180,
    profileCompleted: true,
  }),
  upsertUserProfile: vi.fn().mockResolvedValue(undefined),
  getUserSubscription: vi.fn().mockResolvedValue({
    userId: 1,
    plan: "free",
    status: "active",
  }),
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  logWorkout: vi.fn().mockResolvedValue(undefined),
  getWorkoutLogs: vi.fn().mockResolvedValue([]),
  getWorkoutStats: vi.fn().mockResolvedValue({
    total: 5,
    thisWeek: 2,
    thisMonth: 5,
    streak: 2,
    weeklyData: [],
  }),
  saveAiMessage: vi.fn().mockResolvedValue(undefined),
  getAiChatHistory: vi.fn().mockResolvedValue([]),
  saveAiPlan: vi.fn().mockResolvedValue(undefined),
  getAiPlans: vi.fn().mockResolvedValue([]),
  getAllUsers: vi.fn().mockResolvedValue([]),
  getPlatformStats: vi.fn().mockResolvedValue({
    totalUsers: 10,
    proUsers: 3,
    totalWorkouts: 50,
    totalAiChats: 120,
  }),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  countTodayAiMessages: vi.fn().mockResolvedValue(0),
  getUserById: vi.fn().mockResolvedValue(null),
}));

vi.mock("./stripeWebhook", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue("https://checkout.stripe.com/test"),
  registerStripeRoutes: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Here is your fitness advice!" } }],
  }),
}));

// ─── Context Helpers ──────────────────────────────────────────────────────────
type AuthUser = NonNullable<TrpcContext["user"]>;

function makeCtx(overrides: Partial<AuthUser> = {}): TrpcContext {
  const clearedCookies: any[] = [];
  const user: AuthUser = {
    id: 1,
    openId: "test-user-openid",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: any) => clearedCookies.push({ name, options }),
    } as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return makeCtx({ role: "admin" });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: any[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "test", name: "Test", email: "t@t.com",
        loginMethod: "manus", role: "user",
        createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: any) => clearedCookies.push({ name, options }),
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

describe("profile.get", () => {
  it("returns profile and subscription for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.profile.get();
    expect(result).toHaveProperty("profile");
    expect(result).toHaveProperty("subscription");
    expect(result.profile?.displayName).toBe("Test User");
  });
});

describe("profile.setup", () => {
  it("saves profile with valid input", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.profile.setup({
      displayName: "Test User",
      fitnessGoal: "build_muscle",
      fitnessLevel: "Intermediate",
      weightKg: 80,
      heightCm: 180,
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects invalid fitness level", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.profile.setup({
        displayName: "Test",
        fitnessGoal: "build_muscle",
        fitnessLevel: "Expert" as any,
        weightKg: 80,
        heightCm: 180,
      })
    ).rejects.toThrow();
  });
});

describe("workouts.logWorkout", () => {
  it("logs a workout successfully", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.workouts.logWorkout({
      workoutId: "pushup-workout",
      workoutName: "Push-up Workout",
      workoutType: "home",
      durationMinutes: 30,
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects invalid workout type", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.workouts.logWorkout({
        workoutId: "test",
        workoutName: "Test",
        workoutType: "outdoor" as any,
        durationMinutes: 20,
      })
    ).rejects.toThrow();
  });
});

describe("workouts.getStats", () => {
  it("returns workout statistics", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const stats = await caller.workouts.getStats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("streak");
    expect(stats).toHaveProperty("thisWeek");
    expect(stats.total).toBe(5);
  });
});

describe("subscription.createCheckout", () => {
  it("returns a checkout URL", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.createCheckout({
      origin: "https://example.com",
    });
    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(0);
  });
});

describe("admin procedures", () => {
  it("getStats returns platform stats for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const stats = await caller.admin.getStats();
    expect(stats).toHaveProperty("totalUsers");
    expect(stats).toHaveProperty("proUsers");
    expect(stats.totalUsers).toBe(10);
  });

  it("getUsers returns user list for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const users = await caller.admin.getUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it("updateUserRole updates role for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.updateUserRole({ userId: 2, role: "admin" });
    expect(result).toEqual({ success: true });
  });

  it("throws FORBIDDEN for non-admin user on getStats", async () => {
    const caller = appRouter.createCaller(makeCtx({ role: "user" }));
    await expect(caller.admin.getStats()).rejects.toThrow("Admin access required");
  });

  it("throws FORBIDDEN for non-admin user on getUsers", async () => {
    const caller = appRouter.createCaller(makeCtx({ role: "user" }));
    await expect(caller.admin.getUsers()).rejects.toThrow("Admin access required");
  });
});
