import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, ShoppingCart, ArrowLeft, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
};

type Category = {
  id: string;
  name: string;
};

export default function SearchResults() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: allProducts } = trpc.products.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();

  const products: Product[] = allProducts ?? [];
  const categoriesTyped: Category[] = categories ?? [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesPrice =
      product.price >= minPrice && product.price <= maxPrice;

    const matchesCategory =
      !selectedCategory ||
      product.categoryId === Number(selectedCategory);

    return matchesSearch && matchesPrice && matchesCategory;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

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
          <h1 className="text-2xl font-bold text-white">Buscar Produtos</h1>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <div className="glass p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Filtros
                </h3>

                {/* Search */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Buscar
                  </label>

                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder="Nome do produto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Categoria
                  </label>

                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value)
                    }
                    className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Todas as categorias</option>

                    {categoriesTyped.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Faixa de Preço
                  </label>

                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 text-sm">
                        Mínimo: R$ {minPrice.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={minPrice}
                        onChange={(e) =>
                          setMinPrice(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm">
                        Máximo: R$ {maxPrice.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setMinPrice(0);
                    setMaxPrice(10000);
                    setSelectedCategory("");
                  }}
                  variant="outline"
                  className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <p className="text-slate-400">
                  {filteredProducts.length} produto
                  {filteredProducts.length !== 1 ? "s" : ""} encontrado
                  {filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      onClick={() =>
                        navigate(`/produto/${product.id}`)
                      }
                      className="glass cursor-pointer hover:neon-glow transition-smooth group overflow-hidden"
                    >
                      <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <ShoppingCart className="w-12 h-12 text-slate-600" />
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-white mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-bold text-lg">
                            R$ {product.price.toFixed(2)}
                          </span>

                          <Heart className="w-5 h-5 text-slate-400 hover:text-red-500 transition-colors" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Nenhum produto encontrado com esses critérios.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}