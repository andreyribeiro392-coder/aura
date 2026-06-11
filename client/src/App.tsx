import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import AICoach from "./pages/AICoach";
import Progress from "./pages/Progress";
import Upgrade from "./pages/Upgrade";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import { trpc } from "./lib/trpc";
import { Loader2 } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

/** Redirects unauthenticated users to the home page. */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;
  return <Component />;
}

/** Redirects unauthenticated users to home, and users without a completed profile to /setup. */
function AppRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: profileData, isLoading: profileLoading } = trpc.profile.get.useQuery(
    undefined,
    { enabled: !!user }
  );

  const needsSetup = !!profileData && !profileData.profile?.profileCompleted;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profileLoading && needsSetup) {
      navigate("/setup");
    }
  }, [profileLoading, needsSetup, navigate]);

  if (loading || (user && profileLoading)) return <LoadingScreen />;
  if (!user) return null;
  if (needsSetup) return null;

  return <AppLayout><Component /></AppLayout>;
}

/** Renders the Admin page only for users with the admin role. */
function AdminRoute() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    } else if (!loading && user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [loading, user, navigate]);

  if (loading) return <LoadingScreen />;
  if (!user || user.role !== "admin") return null;
  return <AppLayout><Admin /></AppLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/setup">{() => <ProtectedRoute component={ProfileSetup} />}</Route>
      <Route path="/dashboard">{() => <AppRoute component={Dashboard} />}</Route>
      <Route path="/workouts">{() => <AppRoute component={Workouts} />}</Route>
      <Route path="/ai-coach">{() => <AppRoute component={AICoach} />}</Route>
      <Route path="/progress">{() => <AppRoute component={Progress} />}</Route>
      <Route path="/upgrade">{() => <AppRoute component={Upgrade} />}</Route>
      <Route path="/profile">{() => <AppRoute component={Profile} />}</Route>
      <Route path="/admin" component={AdminRoute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
