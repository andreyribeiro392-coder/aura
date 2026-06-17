import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import AdminDashboard from "./pages/AdminDashboard";
import SearchResults from "./pages/SearchResults";
import AIAssistant from "./components/AIAssistant";
import StorefrontNav from "./components/StorefrontNav";

function Router() {
  return (
    <>
      <StorefrontNav />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/categoria/:slug"} component={CategoryPage} />
        <Route path={"/produto/:id"} component={ProductDetail} />
        <Route path={"/carrinho"} component={Cart} />
        <Route path={"/favoritos"} component={Favorites} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/search"} component={SearchResults} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
          <AIAssistant />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
