import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Flame, Dumbbell, Calendar, TrendingUp, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STREAK_MESSAGES = [
  { min: 0, msg: "Start your streak today! 💪" },
  { min: 1, msg: "Great start! Keep going! 🌱" },
  { min: 3, msg: "3 days strong! You're building a habit! ⚡" },
  { min: 7, msg: "One week streak! You're on fire! 🔥" },
  { min: 14, msg: "Two weeks! Incredible dedication! 🏆" },
  { min: 30, msg: "30-day legend! You're unstoppable! 👑" },
];

function getStreakMessage(streak: number) {
  const msg = [...STREAK_MESSAGES].reverse().find(m => streak >= m.min);
  return msg?.msg ?? "Keep going!";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 rounded-xl px-3 py-2 text-sm shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold text-primary">{payload[0].value} workout{payload[0].value !== 1 ? "s" : ""}</p>
      </div>
    );
  }
  return null;
};

export default function Progress() {
  const { data: stats, isLoading } = trpc.workouts.getStats.useQuery();
  const { data: logs } = trpc.workouts.getLogs.useQuery({ limit: 20 });

  const streak = stats?.streak ?? 0;
  const weeklyData = stats?.weeklyData ?? [];

  const statCards = [
    { label: "Total Workouts", value: stats?.total ?? 0, icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "This Week", value: stats?.thisWeek ?? 0, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "This Month", value: stats?.thisMonth ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Day Streak", value: streak, icon: Flame, color: "text-amber-400", bg: "bg-amber-400/10", suffix: streak > 0 ? "🔥" : "" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 w-48 bg-secondary/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-secondary/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Progress Tracker</h1>
        <p className="text-muted-foreground text-sm">Track your consistency, streaks and workout history.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="p-5 rounded-2xl border border-border/50 bg-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", card.bg)}>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {card.value}{card.suffix}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Streak Banner */}
      {streak > 0 && (
        <div className="p-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0">
            <Flame className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{streak} Day Streak 🔥</div>
            <p className="text-sm text-muted-foreground">{getStreakMessage(streak)}</p>
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-lg font-semibold mb-5">Workouts This Week</h2>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
              <Bar
                dataKey="workouts"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No workouts logged this week yet. Start training!
          </div>
        )}
      </div>

      {/* Recent Workout History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Workout History</h2>
        {!logs || logs.length === 0 ? (
          <div className="p-8 rounded-2xl border border-border/30 bg-card/50 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No workouts logged yet</h3>
            <p className="text-sm text-muted-foreground">Complete a workout from the library to start tracking your progress.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(logs as any[]).map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/50 hover:border-border/50 transition-colors">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  log.workoutType === "home" ? "bg-emerald-400/10" : "bg-blue-400/10"
                )}>
                  <Dumbbell className={cn("w-5 h-5", log.workoutType === "home" ? "text-emerald-400" : "text-blue-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{log.workoutName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {log.workoutType} workout · {new Date(log.completedAt).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric"
                    })}
                  </p>
                </div>
                {log.durationMinutes && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {log.durationMinutes} min
                  </div>
                )}
                <Badge className="text-xs bg-secondary text-muted-foreground border-border/50 capitalize flex-shrink-0">
                  {log.workoutType}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
