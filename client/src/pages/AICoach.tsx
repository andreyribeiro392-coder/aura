import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Brain, Send, Crown, Dumbbell, Apple, Sparkles,
  Lock, ArrowRight, MessageSquare, Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "What's the best workout for building muscle at home?",
  "How many calories should I eat to lose weight?",
  "Can you explain the benefits of HIIT training?",
  "What should I eat before and after a workout?",
  "How do I improve my squat form?",
];

export default function AICoach() {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "plans">("chat");
  const [generatingPlan, setGeneratingPlan] = useState<"workout" | "nutrition" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: profileData } = trpc.profile.get.useQuery();
  const { data: chatHistory, refetch: refetchHistory } = trpc.ai.getChatHistory.useQuery();
  const { data: plans, refetch: refetchPlans } = trpc.ai.getPlans.useQuery();

  const isPro = profileData?.subscription?.plan === "pro" && profileData?.subscription?.status === "active";

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: () => {
      setInput("");
      refetchHistory();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const workoutPlanMutation = trpc.ai.generateWorkoutPlan.useMutation({
    onSuccess: () => {
      toast.success("Workout plan generated! 🏋️");
      setGeneratingPlan(null);
      refetchPlans();
      setActiveTab("plans");
    },
    onError: (err) => {
      toast.error(err.message);
      setGeneratingPlan(null);
    },
  });

  const nutritionPlanMutation = trpc.ai.generateNutritionPlan.useMutation({
    onSuccess: () => {
      toast.success("Nutrition plan generated! 🥗");
      setGeneratingPlan(null);
      refetchPlans();
      setActiveTab("plans");
    },
    onError: (err) => {
      toast.error(err.message);
      setGeneratingPlan(null);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatMutation.isPending]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    chatMutation.mutate({ message: input.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const workoutPlans = plans?.filter(p => p.planType === "workout") ?? [];
  const nutritionPlans = plans?.filter(p => p.planType === "nutrition") ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            AI Coach
          </h1>
          <p className="text-muted-foreground text-sm">
            Your personal fitness and nutrition coach, powered by AI.
            {!isPro && <span className="text-amber-400 ml-1">Free: 5 messages/day</span>}
          </p>
        </div>
        {isPro && (
          <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" /> PRO
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit flex-shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "plans" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="w-4 h-4" /> AI Plans
          {!isPro && <Lock className="w-3 h-3 text-amber-400" />}
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px] max-h-[500px]">
            {(!chatHistory || chatHistory.length === 0) && !chatMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Ask Your AI Coach</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Get personalized advice on workouts, nutrition, recovery, and more. Your profile is used to tailor responses.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs px-3 py-2 rounded-full border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory?.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border/50 text-foreground rounded-tl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions (if has history) */}
          {chatHistory && chatHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {SUGGESTED_QUESTIONS.slice(0, 2).map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-3 flex-shrink-0">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI coach anything about fitness, nutrition, or wellness..."
              className="resize-none bg-secondary/50 border-border/50 focus:border-primary min-h-[52px] max-h-32"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="gradient-primary text-primary-foreground border-0 self-end h-[52px] px-4"
            >
              {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-6 flex-1">
          {!isPro ? (
            <div className="p-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">PRO Feature</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                AI-generated personalized workout and nutrition plans are exclusive to PRO members.
              </p>
              <Button
                onClick={() => navigate("/upgrade")}
                className="gradient-gold text-primary-foreground border-0 font-semibold"
              >
                Upgrade to PRO <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              {/* Generate Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => { setGeneratingPlan("workout"); workoutPlanMutation.mutate(); }}
                  disabled={generatingPlan !== null}
                  className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all text-left disabled:opacity-60"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-1">Generate Workout Plan</h3>
                  <p className="text-sm text-muted-foreground">4-week progressive program tailored to your goals and level.</p>
                  {generatingPlan === "workout" && (
                    <div className="flex items-center gap-2 mt-3 text-primary text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                    </div>
                  )}
                </button>

                <button
                  onClick={() => { setGeneratingPlan("nutrition"); nutritionPlanMutation.mutate(); }}
                  disabled={generatingPlan !== null}
                  className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all text-left disabled:opacity-60"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Apple className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold mb-1">Generate Nutrition Plan</h3>
                  <p className="text-sm text-muted-foreground">Personalized meal plan with macros, calories and recipes.</p>
                  {generatingPlan === "nutrition" && (
                    <div className="flex items-center gap-2 mt-3 text-primary text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                    </div>
                  )}
                </button>
              </div>

              {/* Generated Plans */}
              {(workoutPlans.length > 0 || nutritionPlans.length > 0) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Your Generated Plans</h3>
                  {[...workoutPlans, ...nutritionPlans]
                    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                    .map(plan => (
                      <div key={plan.id} className="p-5 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            plan.planType === "workout" ? "bg-emerald-400/10" : "bg-amber-400/10"
                          )}>
                            {plan.planType === "workout"
                              ? <Dumbbell className="w-5 h-5 text-emerald-400" />
                              : <Apple className="w-5 h-5 text-amber-400" />
                            }
                          </div>
                          <div>
                            <h4 className="font-semibold capitalize">{plan.planType} Plan</h4>
                            <p className="text-xs text-muted-foreground">
                              Generated {new Date(plan.generatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none text-sm">
                          <Streamdown>{plan.content}</Streamdown>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
