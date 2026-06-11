import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, User, Target, Dumbbell, Scale, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { value: "lose_weight", label: "Lose Weight", emoji: "🔥" },
  { value: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { value: "improve_endurance", label: "Improve Endurance", emoji: "🏃" },
  { value: "stay_healthy", label: "Stay Healthy", emoji: "❤️" },
  { value: "increase_flexibility", label: "Increase Flexibility", emoji: "🧘" },
] as const;

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export default function Profile() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [editing, setEditing] = useState(false);

  const { data: profileData, refetch } = trpc.profile.get.useQuery();
  const profile = profileData?.profile;
  const subscription = profileData?.subscription;
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  const [form, setForm] = useState({
    displayName: profile?.displayName || user?.name || "",
    fitnessGoal: profile?.fitnessGoal || "stay_healthy",
    fitnessLevel: profile?.fitnessLevel || "Beginner",
    weightKg: profile?.weightKg?.toString() || "",
    heightCm: profile?.heightCm?.toString() || "",
  });

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditing(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    updateMutation.mutate({
      displayName: form.displayName,
      fitnessGoal: form.fitnessGoal as any,
      fitnessLevel: form.fitnessLevel as any,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
      heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
    });
  };

  const displayName = profile?.displayName || user?.name || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  // Sync form when profile loads (useEffect to avoid setState during render)
  useEffect(() => {
    if (profile && !editing) {
      setForm({
        displayName: profile.displayName || user?.name || "",
        fitnessGoal: profile.fitnessGoal || "stay_healthy",
        fitnessLevel: profile.fitnessLevel || "Beginner",
        weightKg: profile.weightKg?.toString() || "",
        heightCm: profile.heightCm?.toString() || "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="border-border/50">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="gradient-primary text-primary-foreground border-0">
              <Check className="w-4 h-4 mr-1" /> {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card">
        <div className="flex items-center gap-5">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Display Name</Label>
                <Input
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  className="h-10 bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  {isPro && <Crown className="w-5 h-5 text-amber-400" />}
                </div>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" /> Subscription
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{isPro ? "AuraFit PRO" : "Free Plan"}</span>
              {isPro ? (
                <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-xs">Active</Badge>
              ) : (
                <Badge className="bg-secondary text-muted-foreground border-border/50 text-xs">Free</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPro ? "Full access to all AI features" : "5 AI messages/day · Basic features"}
            </p>
          </div>
          {!isPro && (
            <Button size="sm" onClick={() => navigate("/upgrade")} className="gradient-primary text-primary-foreground border-0">
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Fitness Goal */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Fitness Goal
        </h3>
        {editing ? (
          <div className="grid grid-cols-1 gap-2">
            {GOALS.map(goal => (
              <button
                key={goal.value}
                onClick={() => setForm(f => ({ ...f, fitnessGoal: goal.value }))}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm",
                  form.fitnessGoal === goal.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/40 text-muted-foreground hover:border-border hover:bg-secondary/30"
                )}
              >
                <span>{goal.emoji}</span>
                <span className="font-medium">{goal.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{GOALS.find(g => g.value === profile?.fitnessGoal)?.emoji || "🎯"}</span>
            <span className="font-medium">{GOALS.find(g => g.value === profile?.fitnessGoal)?.label || "Not set"}</span>
          </div>
        )}
      </div>

      {/* Fitness Level */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" /> Fitness Level
        </h3>
        {editing ? (
          <div className="flex gap-2">
            {LEVELS.map(level => (
              <button
                key={level}
                onClick={() => setForm(f => ({ ...f, fitnessLevel: level }))}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  form.fitnessLevel === level
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/40 text-muted-foreground hover:border-border"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        ) : (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
            {profile?.fitnessLevel || "Not set"}
          </Badge>
        )}
      </div>

      {/* Body Metrics */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" /> Body Metrics
        </h3>
        {editing ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
              <Input
                type="number"
                value={form.weightKg}
                onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                className="h-10 bg-secondary/50 border-border/50 focus:border-primary"
                placeholder="70"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Height (cm)</Label>
              <Input
                type="number"
                value={form.heightCm}
                onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
                className="h-10 bg-secondary/50 border-border/50 focus:border-primary"
                placeholder="175"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="text-2xl font-bold text-foreground">{profile?.weightKg ?? "—"}</div>
              <div className="text-xs text-muted-foreground">kg</div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="text-2xl font-bold text-foreground">{profile?.heightCm ?? "—"}</div>
              <div className="text-xs text-muted-foreground">cm</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
