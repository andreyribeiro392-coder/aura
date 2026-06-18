import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

type Favorite = {
  id: number;
  userId: number;
  productId: number;
  createdAt: Date;
};

export default function Favorites() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: favorites } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const favoritesTyped: Favorite[] = Array.isArray(favorites)
    ? (favorites as Favorite[])
    : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">
            Você precisa fazer login para ver seus favoritos.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-white/10 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Meus Favoritos</h1>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          {favoritesTyped.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favoritesTyped.map((favorite) => (
                <Card
                  key={favorite.id}
                  onClick={() =>
                    navigate(`/produto/${favorite.productId}`)
                  }
                  className="glass cursor-pointer hover:neon-glow transition-smooth group overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-slate-600" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white">
                      Produto #{favorite.productId}
                    </h3>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-cyan-400 font-bold">
                        R$ 0,00
                      </span>
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-6">
                Você ainda não tem favoritos
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                Explorar Produtos
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}