import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { createCheckoutSession } from "./stripeWebhook";
import {
  getUserProfile,
  upsertUserProfile,
  getUserSubscription,
  upsertSubscription,
  logWorkout,
  getWorkoutLogs,
  getWorkoutStats,
  saveAiMessage,
  getAiChatHistory,
  saveAiPlan,
  getAiPlans,
  getAllUsers,
  getPlatformStats,
  updateUserRole,
  countTodayAiMessages,
  getUserById,
} from "./db";
import { ENV } from "./_core/env";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
  }
  return next({ ctx });
});

// PRO guard helper
async function requirePro(userId: number) {
  const sub = await getUserSubscription(userId);
  if (!sub || sub.plan !== "pro" || sub.status !== "active") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "PRO subscription required for this feature.",
    });
  }
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      const subscription = await getUserSubscription(ctx.user.id);
      return { profile, subscription, user: ctx.user };
    }),

    setup: protectedProcedure
      .input(
        z.object({
          displayName: z.string().min(1).max(128),
          fitnessGoal: z.enum([
            "lose_weight",
            "build_muscle",
            "improve_endurance",
            "stay_healthy",
            "increase_flexibility",
          ]),
          fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
          weightKg: z.number().min(20).max(500),
          heightCm: z.number().min(50).max(300),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await upsertUserProfile(ctx.user.id, { ...input, profileCompleted: true });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          displayName: z.string().min(1).max(128).optional(),
          fitnessGoal: z
            .enum([
              "lose_weight",
              "build_muscle",
              "improve_endurance",
              "stay_healthy",
              "increase_flexibility",
            ])
            .optional(),
          fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
          weightKg: z.number().min(20).max(500).optional(),
          heightCm: z.number().min(50).max(300).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await upsertUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  workouts: router({
    logWorkout: protectedProcedure
      .input(
        z.object({
          workoutId: z.string(),
          workoutName: z.string(),
          workoutType: z.enum(["home", "gym"]),
          durationMinutes: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await logWorkout(ctx.user.id, input);
        return { success: true };
      }),

    getLogs: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return getWorkoutLogs(ctx.user.id, input.limit);
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      return getWorkoutStats(ctx.user.id);
    }),
  }),

  ai: router({
    chat: protectedProcedure
      .input(z.object({ message: z.string().min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const sub = await getUserSubscription(ctx.user.id);
        const isPro = sub?.plan === "pro" && sub?.status === "active";

        if (!isPro) {
          const todayCount = await countTodayAiMessages(ctx.user.id);
          if (todayCount >= 5) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Daily limit of 5 AI messages reached. Upgrade to PRO for unlimited access.",
            });
          }
        }

        const profile = await getUserProfile(ctx.user.id);
        const history = await getAiChatHistory(ctx.user.id, 10);

        const systemPrompt = `You are AuraFit AI, an expert fitness coach and nutritionist. You provide personalized, science-backed advice.

User Profile:
- Name: ${profile?.displayName || ctx.user.name || "User"}
- Fitness Goal: ${profile?.fitnessGoal?.replace(/_/g, " ") || "general fitness"}
- Fitness Level: ${profile?.fitnessLevel || "Beginner"}
- Weight: ${profile?.weightKg ? profile.weightKg + " kg" : "not specified"}
- Height: ${profile?.heightCm ? profile.heightCm + " cm" : "not specified"}

Guidelines:
- Be concise, motivating and practical
- Tailor advice to the user's level and goals
- Use metric units
- Format responses with markdown for readability
- Keep responses under 400 words unless a detailed plan is requested`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof rawContent === 'string' ? rawContent : "I'm sorry, I couldn't generate a response.";

        await saveAiMessage(ctx.user.id, "user", input.message);
        await saveAiMessage(ctx.user.id, "assistant", assistantMessage);

        return { message: assistantMessage, isPro };
      }),

    getChatHistory: protectedProcedure.query(async ({ ctx }) => {
      return getAiChatHistory(ctx.user.id, 50);
    }),

    generateWorkoutPlan: protectedProcedure.mutation(async ({ ctx }) => {
      await requirePro(ctx.user.id);

      const profile = await getUserProfile(ctx.user.id);
      if (!profile?.profileCompleted) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Complete your profile first." });
      }

      const prompt = `Create a detailed 4-week progressive workout plan for:
- Goal: ${profile.fitnessGoal?.replace(/_/g, " ")}
- Level: ${profile.fitnessLevel}
- Weight: ${profile.weightKg} kg, Height: ${profile.heightCm} cm

Format the plan with:
1. Weekly overview (4 weeks)
2. Daily workout schedule (5 days/week)
3. Each exercise with sets, reps, rest time
4. Progressive overload notes
5. Recovery recommendations

Use markdown formatting with clear headers and tables.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert certified personal trainer creating personalized workout programs." },
          { role: "user", content: prompt },
        ],
      });

      const rawWorkout = response.choices[0]?.message?.content;
      const planContent = typeof rawWorkout === 'string' ? rawWorkout : "";
      await saveAiPlan(ctx.user.id, "workout", planContent);
      return { plan: planContent };
    }),

    generateNutritionPlan: protectedProcedure.mutation(async ({ ctx }) => {
      await requirePro(ctx.user.id);

      const profile = await getUserProfile(ctx.user.id);
      if (!profile?.profileCompleted) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Complete your profile first." });
      }

      const prompt = `Create a detailed personalized nutrition plan for:
- Goal: ${profile.fitnessGoal?.replace(/_/g, " ")}
- Level: ${profile.fitnessLevel}
- Weight: ${profile.weightKg} kg, Height: ${profile.heightCm} cm

Include:
1. Daily calorie target and macronutrient breakdown (protein, carbs, fats)
2. 7-day meal plan with breakfast, lunch, dinner and snacks
3. Pre and post-workout nutrition
4. Hydration guidelines
5. Foods to prioritize and avoid

Use markdown formatting with clear headers and tables.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a certified sports nutritionist creating personalized nutrition programs." },
          { role: "user", content: prompt },
        ],
      });

      const rawNutrition = response.choices[0]?.message?.content;
      const planContent = typeof rawNutrition === 'string' ? rawNutrition : "";
      await saveAiPlan(ctx.user.id, "nutrition", planContent);
      return { plan: planContent };
    }),

    getPlans: protectedProcedure.query(async ({ ctx }) => {
      return getAiPlans(ctx.user.id);
    }),
  }),

  subscription: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserSubscription(ctx.user.id);
    }),

    createCheckout: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const checkoutUrl = await createCheckoutSession(
          ctx.user.id,
          ctx.user.email || "",
          ctx.user.name || "User",
          input.origin
        );
        return { url: checkoutUrl };
      }),

    activatePro: protectedProcedure
      .input(z.object({ stripeSessionId: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await upsertSubscription(ctx.user.id, {
          plan: "pro",
          status: "active",
          stripeSubscriptionId: input.stripeSessionId,
        });
        return { success: true };
      }),
  }),

  admin: router({
    getUsers: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    getStats: adminProcedure.query(async () => {
      return getPlatformStats();
    }),

    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    getUserDetail: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getUserById(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
