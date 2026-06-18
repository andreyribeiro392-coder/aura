import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductById,
  getFeaturedProducts,
  getCartItems,
  addToCart,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.email !== "andreyribeiro392@gmail.com") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access only" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(() => getCategories()),
    bySlug: publicProcedure.input(z.string()).query(({ input }) => getCategoryBySlug(input)),
  }),

  // Products
  products: router({
    list: publicProcedure
      .input(z.object({ categoryId: z.number().optional() }).optional())
      .query(({ input }) => getProducts(input?.categoryId)),
    byId: publicProcedure.input(z.number()).query(({ input }) => getProductById(input)),
    featured: publicProcedure.query(() => getFeaturedProducts()),
  }),

  // Cart
  cart: router({
    list: protectedProcedure.query(({ ctx }) => getCartItems(ctx.user.id)),
    add: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1) }))
      .mutation(({ ctx, input }) => addToCart(ctx.user.id, input.productId, input.quantity)),
  }),

  // Favorites
  favorites: router({
    list: protectedProcedure.query(({ ctx }) => getFavorites(ctx.user.id)),
    add: protectedProcedure
      .input(z.number())
      .mutation(({ ctx, input }) => addToFavorites(ctx.user.id, input)),
    remove: protectedProcedure
      .input(z.number())
      .mutation(({ ctx, input }) => removeFromFavorites(ctx.user.id, input)),
  }),

  // Profile
  profile: router({
    get: protectedProcedure.query(({ ctx }) => ({
      profile: {
        displayName: ctx.user.name || "User",
        fitnessGoal: "stay_healthy",
        fitnessLevel: "Beginner",
        weightKg: 70,
        heightCm: 175,
      },
      subscription: {
        plan: "free",
        status: "active",
      },
    })),
    update: protectedProcedure
      .input(z.object({
        displayName: z.string().optional(),
        fitnessGoal: z.string().optional(),
        fitnessLevel: z.string().optional(),
        weightKg: z.number().optional(),
        heightCm: z.number().optional(),
      }))
      .mutation(({ input }) => ({ success: true })),
    setup: protectedProcedure
      .input(z.object({
        displayName: z.string(),
        fitnessGoal: z.string(),
        fitnessLevel: z.string(),
        weightKg: z.number(),
        heightCm: z.number(),
      }))
      .mutation(({ input }) => ({ success: true })),
  }),

  // AI
  ai: router({
    getChatHistory: protectedProcedure.query(() => []),
    getPlans: protectedProcedure.query(() => []),
    chat: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(({ input }) => ({ response: "AI response" })),
    generateWorkoutPlan: protectedProcedure
      .mutation(() => ({ success: true })),
    generateNutritionPlan: protectedProcedure
      .mutation(() => ({ success: true })),
  }),

  // Workouts
  workouts: router({
    getStats: protectedProcedure.query(() => ({
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      streak: 0,
      weeklyData: [],
      recentLogs: [],
    })),
    getLogs: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(() => []),
    logWorkout: protectedProcedure
      .input(z.object({
        workoutId: z.number(),
        workoutName: z.string(),
        workoutType: z.string(),
        durationMinutes: z.number().optional(),
      }))
      .mutation(({ input }) => ({ success: true })),
  }),

  // Admin
  admin: router({
    getStats: adminProcedure.query(() => ({
      totalUsers: 0,
      proUsers: 0,
      totalWorkouts: 0,
      totalAiChats: 0,
    })),
    getUsers: adminProcedure.query(() => []),
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.string(),
      }))
      .mutation(({ input }) => ({ success: true })),
  }),
});

export type AppRouter = typeof appRouter;
