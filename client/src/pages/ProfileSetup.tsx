import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, ChevronRight, ChevronLeft, Target, Dumbbell, Scale, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { value: "lose_weight", label: "Lose Weight", emoji: "🔥", desc: "Burn fat and slim down" },
  { value: "build_muscle", label: "Build Muscle", emoji: "💪", desc: "Gain strength and mass" },
  { value: "improve_endurance", label: "Improve Endurance", emoji: "🏃", desc: "Run farther, last longer" },
  { value: "stay_healthy", label: "Stay Healthy", emoji: "❤️", desc: "Maintain overall wellness" },
  { value: "increase_flexibility", label: "Increase Flexibility", emoji: "🧘", desc: "Improve mobility and stretch" },
] as const;

const LEVELS = [
  { value: "Beginner", label: "Beginner", emoji: "🌱", desc: "New to fitness or returning after a break" },
  { value: "Intermediate", label: "Intermediate", emoji: "⚡", desc: "Training consistently for 6+ months" },
  { value: "Advanced", label: "Advanced", emoji: "🏆", desc: "Experienced athlete with 2+ years" },
] as const;

type GoalValue = typeof GOALS[number]["value"];
type LevelValue = typeof LEVELS[number]["value"];

export default function ProfileSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    displayName: "",
    fitnessGoal: "" as GoalValue | "",
    fitnessLevel: "" as LevelValue | "",
    weightKg: "",
    heightCm: "",
  });

  const setupMutation = trpc.profile.setup.useMutation({
    onSuccess: () => {
      toast.success("Profile created! Welcome to AuraFit Pro 🎉");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    if (step === 1) return form.displayName.trim().length >= 1;
    if (step === 2) return form.fitnessGoal !== "";
    if (step === 3) return form.fitnessLevel !== "";
    if (step === 4) return form.weightKg !== "" && form.heightCm !== "";
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    if (!form.fitnessGoal || !form.fitnessLevel) return;
    setupMutation.mutate({
      displayName: form.displayName,
      fitnessGoal: form.fitnessGoal,
      fitnessLevel: form.fitnessLevel,
      weightKg: parseFloat(form.weightKg),
      heightCm: parseFloat(form.heightCm),
    });
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">AuraFit <span className="text-gradient-primary">Pro</span></span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Step {step} of {totalSteps}</span>
              <span className="text-xs text-primary font-medium">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👋</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to AuraFit Pro</h2>
                <p className="text-muted-foreground text-sm">Let's set up your profile to personalize your experience.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">What should we call you?</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && canProceed() && handleNext()}
                />
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What's your main goal?</h2>
                <p className="text-muted-foreground text-sm">We'll tailor your workouts and plans around this.</p>
              </div>
              <div className="space-y-2">
                {GOALS.map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => setForm(f => ({ ...f, fitnessGoal: goal.value }))}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left",
                      form.fitnessGoal === goal.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 bg-secondary/30 hover:border-border hover:bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <div className="font-medium text-sm text-foreground">{goal.label}</div>
                      <div className="text-xs text-muted-foreground">{goal.desc}</div>
                    </div>
                    {form.fitnessGoal === goal.value && (
                      <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Level */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your fitness level?</h2>
                <p className="text-muted-foreground text-sm">Be honest — we'll calibrate the intensity accordingly.</p>
              </div>
              <div className="space-y-3">
                {LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setForm(f => ({ ...f, fitnessLevel: level.value }))}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left",
                      form.fitnessLevel === level.value
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-secondary/30 hover:border-border hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-2xl">{level.emoji}</span>
                    <div>
                      <div className="font-medium text-sm text-foreground">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.desc}</div>
                    </div>
                    {form.fitnessLevel === level.value && (
                      <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Body Metrics */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Body metrics</h2>
                <p className="text-muted-foreground text-sm">Used to calculate your calorie needs and personalize plans.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    min={20}
                    max={500}
                    value={form.weightKg}
                    onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                    className="h-12 bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    min={50}
                    max={300}
                    value={form.heightCm}
                    onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
                    className="h-12 bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Your data is private and used only to personalize your fitness experience.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || setupMutation.isPending}
              className="gradient-primary text-primary-foreground border-0 px-6"
            >
              {step === totalSteps ? (
                setupMutation.isPending ? "Creating..." : "Complete Setup"
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
