import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const productId = parseInt(window.location.pathname.split("/").pop() || "0");
  const { data: product } = trpc.products.byId.useQuery(productId);
  const addToCartMutation = trpc.cart.add.useMutation();
  const addToFavoritesMutation = trpc.favorites.add.useMutation();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await addToCartMutation.mutateAsync({ productId, quantity });
      // Show success toast
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await addToFavoritesMutation.mutateAsync(productId);
    } catch (error) {
      console.error("Failed to add to favorites:", error);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Detalhes do Produto</h1>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="glass p-8 rounded-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="w-24 h-24 text-slate-600" />
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(parseFloat(product.rating as any) || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400">
                    {product.reviews} avaliações
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold text-cyan-400">
                    R$ {parseFloat(product.price as any).toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-2">Descrição</h3>
                  <p className="text-slate-300 leading-relaxed">{product.description}</p>
                </div>

                {/* Stock */}
                <div className="mb-8">
                  <p className={`text-sm font-semibold ${
                    product.stock > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {product.stock > 0 ? `${product.stock} em estoque` : "Fora de estoque"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      −
                    </button>
                    <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      +
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToFavorites}
                    variant="outline"
                    size="icon"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addToCartMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-6 text-lg rounded-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addToCartMutation.isPending ? "Adicionando..." : "Adicionar ao Carrinho"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
