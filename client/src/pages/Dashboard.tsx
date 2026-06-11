import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  Dumbbell, Brain, TrendingUp, Crown, Flame, Calendar,
  ChevronRight, Target, Zap, ArrowRight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight",
  build_muscle: "Build Muscle",
  improve_endurance: "Improve Endurance",
  stay_healthy: "Stay Healthy",
  increase_flexibility: "Increase Flexibility",
};

const QUICK_ACTIONS = [
  { icon: Dumbbell, label: "Browse Workouts", path: "/workouts", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: Brain, label: "Ask AI Coach", path: "/ai-coach", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: TrendingUp, label: "View Progress", path: "/progress", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: Crown, label: "Upgrade PRO", path: "/upgrade", color: "text-amber-400", bg: "bg-amber-400/10" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: profileData, isLoading } = trpc.profile.get.useQuery();
  const { data: stats } = trpc.workouts.getStats.useQuery();

  const profile = profileData?.profile;
  const subscription = profileData?.subscription;
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";
  const displayName = profile?.displayName || user?.name || "Athlete";
  const greeting = getGreeting();

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  const statCards = [
    { label: "Total Workouts", value: stats?.total ?? 0, icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "This Week", value: stats?.thisWeek ?? 0, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "This Month", value: stats?.thisMonth ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Day Streak", value: stats?.streak ?? 0, icon: Flame, color: "text-amber-400", bg: "bg-amber-400/10", suffix: "🔥" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 w-64 bg-secondary/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-secondary/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl font-bold text-foreground">
            {displayName} {isPro && <Crown className="inline w-6 h-6 text-amber-400 mb-1" />}
          </h1>
          {profile?.fitnessGoal && (
            <div className="flex items-center gap-2 mt-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Goal: <span className="text-foreground font-medium">{GOAL_LABELS[profile.fitnessGoal]}</span>
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-sm text-muted-foreground">
                Level: <span className="text-foreground font-medium">{profile.fitnessLevel}</span>
              </span>
            </div>
          )}
        </div>
        {!isPro && (
          <Button
            onClick={() => navigate("/upgrade")}
            size="sm"
            className="hidden sm:flex gradient-gold text-primary-foreground border-0 font-semibold"
          >
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to PRO
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="p-5 rounded-2xl border border-border/50 bg-card hover:border-border transition-colors">
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-200 hover:-translate-y-0.5 text-left"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", action.bg)}>
                <action.icon className={cn("w-5 h-5", action.color)} />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentLogs && stats.recentLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Workouts</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/progress")} className="text-primary text-sm">
              View All <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
          <div className="space-y-2">
            {(stats.recentLogs as any[]).slice(0, 5).map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/50">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{log.workoutName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {log.workoutType} workout · {new Date(log.completedAt).toLocaleDateString()}
                  </p>
                </div>
                {log.durationMinutes && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">{log.durationMinutes} min</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRO Upsell (if free) */}
      {!isPro && (
        <div className="p-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Unlock the Full AI Experience</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-generated workout and nutrition plans, unlimited coaching messages, and advanced analytics.
              </p>
              <Button
                onClick={() => navigate("/upgrade")}
                size="sm"
                className="gradient-gold text-primary-foreground border-0 font-semibold"
              >
                Upgrade to PRO — $9.99/mo
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
