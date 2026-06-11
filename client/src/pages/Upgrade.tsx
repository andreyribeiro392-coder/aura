import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation, useSearch } from "wouter";
import {
  Crown, CheckCircle2, Zap, Brain, Dumbbell, Apple,
  BarChart3, Shield, Star, ArrowRight, Sparkles
} from "lucide-react";

const PRO_FEATURES = [
  { icon: Brain, label: "Unlimited AI coach messages", desc: "No daily limits — ask anything, anytime" },
  { icon: Dumbbell, label: "AI-generated workout plans", desc: "4-week progressive programs tailored to your goals" },
  { icon: Apple, label: "Personalized nutrition plans", desc: "Macro-optimized meal plans with weekly menus" },
  { icon: BarChart3, label: "Advanced analytics", desc: "Detailed progress insights and performance trends" },
  { icon: Shield, label: "Priority support", desc: "Get help faster with dedicated PRO support" },
  { icon: Sparkles, label: "Early access to new features", desc: "Be the first to try new AI capabilities" },
];

export default function Upgrade() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isSuccess = params.get("success") === "true";
  const isCanceled = params.get("canceled") === "true";

  const { data: profileData, refetch } = trpc.profile.get.useQuery();
  const checkoutMutation = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const isPro = profileData?.subscription?.plan === "pro" && profileData?.subscription?.status === "active";

  useEffect(() => {
    if (isSuccess) {
      toast.success("Welcome to AuraFit PRO! Your subscription is now active 🎉");
      refetch();
      // Clean URL
      navigate("/upgrade", { replace: true });
    }
    if (isCanceled) {
      toast.info("Checkout canceled. You can upgrade anytime.");
      navigate("/upgrade", { replace: true });
    }
  }, [isSuccess, isCanceled]);

  const handleUpgrade = () => {
    checkoutMutation.mutate({ origin: window.location.origin });
  };

  if (isPro) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center mx-auto mb-6 float">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-3">You're a PRO Member! 🎉</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            You have full access to all AI-powered features. Keep crushing your goals!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/ai-coach")} className="gradient-primary text-primary-foreground border-0">
              <Brain className="w-4 h-4 mr-2" /> Open AI Coach
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-amber-400/10 text-amber-400 border-amber-400/20">
          <Crown className="w-3.5 h-3.5 mr-1.5" />
          Upgrade to PRO
        </Badge>
        <h1 className="text-4xl font-bold mb-3">
          Unlock the Full{" "}
          <span className="text-gradient-primary">AI Experience</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Get AI-generated plans, unlimited coaching, and advanced analytics to accelerate your fitness journey.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto p-8 rounded-3xl border-2 border-primary/40 bg-card relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">AuraFit PRO</h2>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-muted-foreground text-sm">Everything you need to transform your body</p>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-5xl font-bold text-gradient-primary">$9.99</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <Button
            className="w-full gradient-primary text-primary-foreground border-0 h-14 text-base font-semibold mb-6"
            onClick={handleUpgrade}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? (
              "Preparing checkout..."
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to PRO Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Secure payment</span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> 4.9/5 rating</span>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Test with card <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">4242 4242 4242 4242</code>
          </p>
        </div>
      </div>

      {/* Features List */}
      <div>
        <h3 className="text-lg font-semibold text-center mb-6">Everything included in PRO</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRO_FEATURES.map(feature => (
            <div key={feature.label} className="flex items-start gap-4 p-4 rounded-2xl border border-border/50 bg-card/50">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="p-6 rounded-2xl border border-border/30 bg-card/50">
        <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-foreground mb-1">Can I cancel anytime?</p>
            <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. You'll retain PRO access until the end of the billing period.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Is my payment secure?</p>
            <p className="text-muted-foreground">All payments are processed by Stripe, a PCI-DSS Level 1 certified payment processor. We never store your card details.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">What happens to my data if I cancel?</p>
            <p className="text-muted-foreground">Your workout history and progress data are always preserved. You'll lose access to AI-generated plans but can still view previously generated ones.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
