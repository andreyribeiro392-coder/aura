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
      },
      subscription: {
        plan: "free",
        status: "active",
      },
    })),
  }),

  // AI
  ai: router({
    getChatHistory: protectedProcedure.query(() => []),
    getPlans: protectedProcedure.query(() => []),
    chat: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(({ input }) => ({ response: "AI response" })),
  }),
});

export type AppRouter = typeof appRouter;
