import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShoppingCart, Heart, User, LogOut, Search, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export default function StorefrontNav() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">🚀</span>
          </div>
          <span className="text-white font-bold text-lg hidden sm:inline">Marketplace</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar produtos..."
              onClick={() => navigate("/search")}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-4 pr-10 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/search")}
            className="md:hidden text-slate-300 hover:text-cyan-400"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/carrinho")}
            className="text-slate-300 hover:text-cyan-400 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </Button>

          {/* Favorites */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/favoritos")}
            className="text-slate-300 hover:text-red-400"
          >
            <Heart className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-300 hover:text-cyan-400"
            >
              {isAuthenticated ? (
                <User className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 glass rounded-lg overflow-hidden shadow-lg">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-slate-700/50">
                      <p className="text-white font-semibold text-sm">{user?.name || user?.email}</p>
                      <p className="text-slate-400 text-xs">{user?.email}</p>
                    </div>

                    {user?.email === "andreyribeiro392@gmail.com" && (
                      <button
                        onClick={() => {
                          navigate("/admin");
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-cyan-400 hover:bg-slate-800/50 transition-colors text-sm"
                      >
                        ⚙️ Painel Administrativo
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800/50 transition-colors text-sm flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </>
                ) : (
                  <a
                    href={getLoginUrl()}
                    className="block px-4 py-2 text-cyan-400 hover:bg-slate-800/50 transition-colors text-sm"
                  >
                    Fazer Login
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
