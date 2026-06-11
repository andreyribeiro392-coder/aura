import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Zap, Brain, TrendingUp, Shield, Star, ChevronRight,
  Dumbbell, Apple, Target, BarChart3, Crown, CheckCircle2,
  ArrowRight, Play, Users, Award
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Fitness Coach",
    description: "Get personalized guidance from an LLM-powered coach that knows your goals, level and history.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Dumbbell,
    title: "Workout Libraries",
    description: "Hundreds of home and gym workouts filtered by level, muscle group and duration.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Apple,
    title: "Nutrition Plans",
    description: "AI-generated meal plans tailored to your calorie needs, macros and dietary preferences.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Log workouts, track streaks and visualize your weekly and monthly performance.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Target,
    title: "Personalized Plans",
    description: "4-week progressive programs built around your specific goals and fitness level.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data stays private. Secure authentication and encrypted storage.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

const STATS = [
  { value: "10K+", label: "Active Members" },
  { value: "500+", label: "Workouts Available" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "4.9★", label: "Average Rating" },
];

const PRO_FEATURES = [
  "Unlimited AI coach messages",
  "AI-generated 4-week workout plans",
  "Personalized nutrition meal plans",
  "Advanced progress analytics",
  "Priority support",
  "Early access to new features",
];

const FREE_FEATURES = [
  "Full workout library access",
  "Progress tracking & streaks",
  "5 AI messages per day",
  "Basic stats dashboard",
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AuraFit <span className="text-gradient-primary">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} size="sm" className="gradient-primary text-primary-foreground border-0">
                Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()} className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
                <Button size="sm" onClick={handleCTA} className="gradient-primary text-primary-foreground border-0">
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-24 relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Fitness Platform
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Train Smarter,{" "}
              <span className="text-gradient-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                Not Harder
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Your AI fitness coach that builds personalized workout and nutrition plans, tracks your progress, and adapts to your goals — all in one elegant platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                onClick={handleCTA}
                className="gradient-primary text-primary-foreground border-0 h-14 px-8 text-base font-semibold pulse-glow"
              >
                Start Your Journey Free
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base border-border/60 hover:border-primary/50 hover:bg-primary/5"
              >
                <Play className="w-4 h-4 mr-2 text-primary" />
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {STATS.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-muted-foreground border-border/50">
              Everything You Need
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Built for{" "}
              <span className="text-gradient-primary">Serious Athletes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every feature is designed to help you reach your fitness goals faster and smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 border-y border-border/30">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Trusted by <strong className="text-foreground">10,000+</strong> athletes</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span><strong className="text-foreground">4.9/5</strong> average rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">500+</strong> workouts available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-muted-foreground border-border/50">
              Simple Pricing
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Choose Your{" "}
              <span className="text-gradient-primary">Plan</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start free. Upgrade when you're ready to unlock the full AI experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl border border-border/50 bg-card">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">Perfect to get started</p>
              </div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-border/60 hover:border-primary/50"
                onClick={handleCTA}
              >
                Get Started Free
              </Button>
            </div>

            {/* PRO Plan */}
            <div className="p-8 rounded-2xl border-2 border-primary/50 bg-card relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="pro-badge">Most Popular</span>
              </div>
              <div className="absolute inset-0 gradient-primary opacity-5 pointer-events-none" />
              <div className="relative">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">PRO</h3>
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gradient-primary">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">Full AI-powered experience</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full gradient-primary text-primary-foreground border-0 font-semibold"
                  onClick={handleCTA}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to PRO
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl border border-primary/20 bg-card relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-5 pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 float">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your{" "}
                <span className="text-gradient-primary">Fitness?</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of athletes who've already elevated their training with AuraFit Pro.
              </p>
              <Button
                size="lg"
                onClick={handleCTA}
                className="gradient-primary text-primary-foreground border-0 h-14 px-10 text-base font-semibold"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm">AuraFit Pro</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} AuraFit Pro. Built for athletes who demand excellence.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
