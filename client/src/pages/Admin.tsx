import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Users, Crown, Dumbbell, MessageSquare, Shield,
  TrendingUp, MoreVertical, Search, ChevronDown
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight",
  build_muscle: "Build Muscle",
  improve_endurance: "Endurance",
  stay_healthy: "Stay Healthy",
  increase_flexibility: "Flexibility",
};

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  // Redirect non-admins
  if (user && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: users, isLoading: usersLoading, refetch } = trpc.admin.getUsers.useQuery();

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredUsers = (users ?? []).filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "PRO Members", value: stats?.proUsers ?? 0, icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Total Workouts", value: stats?.totalWorkouts ?? 0, icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "AI Messages", value: stats?.totalAiChats ?? 0, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm">Platform management and user oversight.</p>
        </div>
        <Badge className="bg-rose-400/10 text-rose-400 border-rose-400/20">Admin Only</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="p-5 rounded-2xl border border-border/50 bg-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", card.bg)}>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? <div className="h-7 w-12 bg-secondary/50 rounded animate-pulse" /> : card.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Conversion Rate */}
      {stats && stats.totalUsers > 0 && (
        <div className="p-5 rounded-2xl border border-border/50 bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">PRO Conversion Rate</h3>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (stats.proUsers / stats.totalUsers) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-foreground">
              {((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.proUsers} of {stats.totalUsers} users have upgraded to PRO
          </p>
        </div>
      )}

      {/* Users Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Users ({filteredUsers.length})</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-secondary/50 border border-border/50 rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground w-56"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-secondary/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Goal</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Level</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr
                      key={u.id}
                      className={cn(
                        "border-b border-border/30 hover:bg-secondary/20 transition-colors",
                        i === filteredUsers.length - 1 && "border-b-0"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{u.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-muted-foreground text-xs">
                          {u.fitnessGoal ? GOAL_LABELS[u.fitnessGoal] || u.fitnessGoal : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{u.fitnessLevel || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.plan === "pro" && u.subscriptionStatus === "active" ? (
                          <Badge className="text-xs bg-amber-400/10 text-amber-400 border-amber-400/20">
                            <Crown className="w-3 h-3 mr-1" /> PRO
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-secondary text-muted-foreground border-border/50">Free</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn(
                          "text-xs",
                          u.role === "admin"
                            ? "bg-rose-400/10 text-rose-400 border-rose-400/20"
                            : "bg-secondary text-muted-foreground border-border/50"
                        )}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border/50">
                            {u.role !== "admin" ? (
                              <DropdownMenuItem
                                onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "admin" })}
                                className="text-sm cursor-pointer"
                              >
                                <Shield className="w-4 h-4 mr-2 text-rose-400" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "user" })}
                                className="text-sm cursor-pointer"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No users found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
