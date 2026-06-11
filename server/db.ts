import { eq, desc, and, gte, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userProfiles, subscriptions, workoutLogs, aiChatMessages, aiPlans } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
      plan: subscriptions.plan,
      subscriptionStatus: subscriptions.status,
      fitnessLevel: userProfiles.fitnessLevel,
      fitnessGoal: userProfiles.fitnessGoal,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .orderBy(desc(users.createdAt));
  return result;
}

// ─── User Profiles ────────────────────────────────────────────────────────────

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserProfile(
  userId: number,
  data: Partial<{
    displayName: string;
    fitnessGoal: "lose_weight" | "build_muscle" | "improve_endurance" | "stay_healthy" | "increase_flexibility";
    fitnessLevel: "Beginner" | "Intermediate" | "Advanced";
    weightKg: number;
    heightCm: number;
    profileCompleted: boolean;
  }>
) {
  const db = await getDb();
  if (!db) return;
  const values = { userId, ...data };
  await db.insert(userProfiles).values(values).onDuplicateKeyUpdate({ set: data });
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertSubscription(
  userId: number,
  data: Partial<{
    plan: "free" | "pro";
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: string;
    currentPeriodEnd: Date;
  }>
) {
  const db = await getDb();
  if (!db) return;
  const values = { userId, ...data };
  await db.insert(subscriptions).values(values).onDuplicateKeyUpdate({ set: data });
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function logWorkout(
  userId: number,
  data: {
    workoutId: string;
    workoutName: string;
    workoutType: "home" | "gym";
    durationMinutes?: number;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(workoutLogs).values({ userId, ...data });
}

export async function getWorkoutLogs(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.completedAt))
    .limit(limit);
}

export async function getWorkoutStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, thisWeek: 0, thisMonth: 0, streak: 0, recentLogs: [] };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalResult] = await db
    .select({ count: count() })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId));

  const [weekResult] = await db
    .select({ count: count() })
    .from(workoutLogs)
    .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.completedAt, weekAgo)));

  const [monthResult] = await db
    .select({ count: count() })
    .from(workoutLogs)
    .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.completedAt, monthAgo)));

  const recentLogs = await db
    .select()
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.completedAt))
    .limit(30);

  // Calculate streak
  const streak = calculateStreak(recentLogs.map(l => l.completedAt));

  // Weekly breakdown (last 7 days)
  const weeklyData = buildWeeklyData(recentLogs.map(l => l.completedAt));

  return {
    total: totalResult?.count ?? 0,
    thisWeek: weekResult?.count ?? 0,
    thisMonth: monthResult?.count ?? 0,
    streak,
    weeklyData,
    recentLogs: recentLogs.slice(0, 10),
  };
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let current = new Date(today);

  const daySet = new Set(sorted.map(d => {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    return day.getTime();
  }));
  const uniqueDays = Array.from(daySet).sort((a, b) => b - a);

  for (const dayTs of uniqueDays) {
    const day = new Date(dayTs);
    if (day.getTime() === current.getTime() || day.getTime() === current.getTime() - 86400000) {
      streak++;
      current = new Date(day.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

function buildWeeklyData(dates: Date[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts: Record<string, number> = {};
  days.forEach(d => (counts[d] = 0));

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  dates
    .filter(d => d >= weekAgo)
    .forEach(d => {
      const day = days[d.getDay()];
      counts[day] = (counts[day] || 0) + 1;
    });

  return days.map(day => ({ day, workouts: counts[day] }));
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export async function saveAiMessage(userId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiChatMessages).values({ userId, role, content });
}

export async function getAiChatHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const msgs = await db
    .select()
    .from(aiChatMessages)
    .where(eq(aiChatMessages.userId, userId))
    .orderBy(desc(aiChatMessages.createdAt))
    .limit(limit);
  return msgs.reverse();
}

export async function countTodayAiMessages(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [result] = await db
    .select({ count: count() })
    .from(aiChatMessages)
    .where(
      and(
        eq(aiChatMessages.userId, userId),
        eq(aiChatMessages.role, "user"),
        gte(aiChatMessages.createdAt, startOfDay)
      )
    );
  return result?.count ?? 0;
}

// ─── AI Plans ─────────────────────────────────────────────────────────────────

export async function saveAiPlan(userId: number, planType: "workout" | "nutrition", content: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiPlans).values({ userId, planType, content });
}

export async function getAiPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(aiPlans)
    .where(eq(aiPlans.userId, userId))
    .orderBy(desc(aiPlans.generatedAt))
    .limit(10);
}

// ─── Admin / Platform Stats ───────────────────────────────────────────────────

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, proUsers: 0, totalWorkouts: 0, totalAiChats: 0 };

  const [totalUsersResult] = await db.select({ count: count() }).from(users);
  const [proUsersResult] = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(and(eq(subscriptions.plan, "pro"), eq(subscriptions.status, "active")));
  const [totalWorkoutsResult] = await db.select({ count: count() }).from(workoutLogs);
  const [totalAiChatsResult] = await db.select({ count: count() }).from(aiChatMessages);

  return {
    totalUsers: totalUsersResult?.count ?? 0,
    proUsers: proUsersResult?.count ?? 0,
    totalWorkouts: totalWorkoutsResult?.count ?? 0,
    totalAiChats: totalAiChatsResult?.count ?? 0,
  };
}
