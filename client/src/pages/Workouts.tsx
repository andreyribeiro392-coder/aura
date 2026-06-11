import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { HOME_WORKOUTS, GYM_EXERCISES, MUSCLE_GROUPS, GYM_CATEGORIES, type HomeWorkout, type GymExercise } from "@shared/workoutData";
import { Dumbbell, Home, Building2, Clock, Flame, ChevronRight, CheckCircle, X, Play, Trophy, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  Intermediate: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  Advanced: "bg-rose-400/10 text-rose-400 border-rose-400/20",
};

const DIFFICULTY_STARS = (d: number) => "★".repeat(d) + "☆".repeat(3 - d);

export default function Workouts() {
  const [tab, setTab] = useState<"home" | "gym">("home");
  const [levelFilter, setLevelFilter] = useState("All");
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [selectedWorkout, setSelectedWorkout] = useState<HomeWorkout | null>(null);
  const [selectedGym, setSelectedGym] = useState<GymExercise | null>(null);
  const [completing, setCompleting] = useState(false);

  const logMutation = trpc.workouts.logWorkout.useMutation({
    onSuccess: () => {
      toast.success("Workout logged! Great work 💪");
      setSelectedWorkout(null);
      setCompleting(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setCompleting(false);
    },
  });

  const filteredHome = HOME_WORKOUTS.filter(w => {
    if (levelFilter !== "All" && w.level !== levelFilter) return false;
    if (muscleFilter !== "All" && w.muscleGroup !== muscleFilter) return false;
    return true;
  });

  const filteredGym = GYM_EXERCISES.filter(e => {
    if (muscleFilter !== "All" && e.category !== muscleFilter) return false;
    return true;
  });

  const handleComplete = (workout: HomeWorkout) => {
    setCompleting(true);
    logMutation.mutate({
      workoutId: workout.id,
      workoutName: workout.name,
      workoutType: "home",
      durationMinutes: parseInt(workout.duration),
    });
  };

  const handleGymLog = (exercise: GymExercise) => {
    logMutation.mutate({
      workoutId: exercise.id,
      workoutName: exercise.name,
      workoutType: "gym",
    });
    toast.success(`${exercise.name} logged! 💪`);
    setSelectedGym(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Workout Library</h1>
        <p className="text-muted-foreground text-sm">Browse and log workouts tailored to your level and goals.</p>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
        <button
          onClick={() => { setTab("home"); setMuscleFilter("All"); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "home" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="w-4 h-4" /> Home Workouts
        </button>
        <button
          onClick={() => { setTab("gym"); setLevelFilter("All"); setMuscleFilter("All"); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "gym" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="w-4 h-4" /> Gym Exercises
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {tab === "home" && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {["All", "Beginner", "Intermediate", "Advanced"].map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    levelFilter === l
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-border/50 self-center hidden sm:block" />
          </>
        )}
        <div className="flex flex-wrap gap-1.5">
          {(tab === "home" ? MUSCLE_GROUPS : GYM_CATEGORIES).map(m => (
            <button
              key={m}
              onClick={() => setMuscleFilter(m)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                muscleFilter === m
                  ? "bg-secondary text-foreground border-border"
                  : "border-border/30 text-muted-foreground hover:border-border/60 hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {tab === "home" ? filteredHome.length : filteredGym.length} {tab === "home" ? "workouts" : "exercises"}
      </p>

      {/* Home Workouts Grid */}
      {tab === "home" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHome.map(workout => (
            <div
              key={workout.id}
              className="group p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              onClick={() => setSelectedWorkout(workout)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{workout.emoji}</span>
                <Badge className={cn("text-xs border", LEVEL_COLORS[workout.level])}>
                  {workout.level}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{workout.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{workout.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{workout.duration}</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{workout.calories} cal</span>
                <span className="ml-auto text-amber-400 text-xs">{DIFFICULTY_STARS(workout.difficulty)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{workout.muscleGroup}</span>
                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gym Exercises Grid */}
      {tab === "gym" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGym.map(exercise => (
            <div
              key={exercise.id}
              className="group p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              onClick={() => setSelectedGym(exercise)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{exercise.emoji}</span>
                <Badge className="text-xs bg-secondary text-muted-foreground border-border/50">
                  {exercise.category}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{exercise.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{exercise.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <div className="text-sm font-bold text-foreground">{exercise.sets}</div>
                  <div className="text-xs text-muted-foreground">Sets</div>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <div className="text-sm font-bold text-foreground">{exercise.reps}</div>
                  <div className="text-xs text-muted-foreground">Reps</div>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <div className="text-sm font-bold text-foreground">{exercise.rest}</div>
                  <div className="text-xs text-muted-foreground">Rest</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Home Workout Detail Modal */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="max-w-lg bg-card border-border/50 max-h-[90vh] overflow-y-auto">
          {selectedWorkout && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedWorkout.emoji}</span>
                  <div>
                    <DialogTitle className="text-xl font-bold">{selectedWorkout.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs border", LEVEL_COLORS[selectedWorkout.level])}>
                        {selectedWorkout.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{selectedWorkout.muscleGroup}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedWorkout.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="text-sm font-bold">{selectedWorkout.duration}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-sm font-bold">{selectedWorkout.calories}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-amber-400">{DIFFICULTY_STARS(selectedWorkout.difficulty)}</div>
                    <div className="text-xs text-muted-foreground">Difficulty</div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkout.benefits.map(b => (
                      <span key={b} className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />{b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exercises */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Exercises</h4>
                  <div className="space-y-2">
                    {selectedWorkout.exercises.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border/30 bg-secondary/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{ex.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Play className="w-3 h-3" />{ex.reps}</span>
                            <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{ex.rest}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{ex.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full gradient-primary text-primary-foreground border-0 font-semibold h-12"
                  onClick={() => handleComplete(selectedWorkout)}
                  disabled={completing || logMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {completing ? "Logging..." : "Mark as Complete"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Gym Exercise Detail Modal */}
      <Dialog open={!!selectedGym} onOpenChange={() => setSelectedGym(null)}>
        <DialogContent className="max-w-lg bg-card border-border/50 max-h-[90vh] overflow-y-auto">
          {selectedGym && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedGym.emoji}</span>
                  <div>
                    <DialogTitle className="text-xl font-bold">{selectedGym.name}</DialogTitle>
                    <Badge className="text-xs bg-secondary text-muted-foreground border-border/50 mt-1">
                      {selectedGym.category}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedGym.description}</p>

                {/* Sets/Reps/Rest */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <div className="text-xl font-bold text-foreground">{selectedGym.sets}</div>
                    <div className="text-xs text-muted-foreground">Sets</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <div className="text-xl font-bold text-foreground">{selectedGym.reps}</div>
                    <div className="text-xs text-muted-foreground">Reps</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <div className="text-xl font-bold text-foreground">{selectedGym.rest}</div>
                    <div className="text-xs text-muted-foreground">Rest</div>
                  </div>
                </div>

                {/* Muscles Worked */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Muscles Worked</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGym.musclesWorked.map(m => (
                      <span key={m} className="text-xs bg-blue-400/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-400/20">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Technique Tips</h4>
                  <ul className="space-y-2">
                    {selectedGym.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="w-full gradient-primary text-primary-foreground border-0 font-semibold h-12"
                  onClick={() => handleGymLog(selectedGym)}
                  disabled={logMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Log This Exercise
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
