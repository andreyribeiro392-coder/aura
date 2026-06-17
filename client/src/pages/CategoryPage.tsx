import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [, navigate] = useLocation();
  const slug = new URLSearchParams(window.location.search).get("slug") || 
               window.location.pathname.split("/").pop() || "";

  const { data: category } = trpc.categories.bySlug.useQuery(slug);
  const { data: products } = trpc.products.list.useQuery(
    category ? { categoryId: category.id } : undefined,
    { enabled: !!category }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-white">{category?.name || "Categoria"}</h1>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <Card
                  key={product.id}
                  onClick={() => navigate(`/produto/${product.id}`)}
                  className="glass cursor-pointer hover:neon-glow transition-smooth group overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ShoppingCart className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold text-lg">
                        R$ {parseFloat(product.price as any).toFixed(2)}
                      </span>
                      <Heart className="w-5 h-5 text-slate-400 hover:text-red-500 transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">Nenhum produto encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
