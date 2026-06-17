import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trash2, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Cart() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: cartItems } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Você precisa fazer login para ver seu carrinho.</p>
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

  const total = cartItems?.reduce((sum, item) => {
    return sum + (parseFloat(item.productId as any) || 0) * item.quantity;
  }, 0) || 0;

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
          <h1 className="text-2xl font-bold text-white">Meu Carrinho</h1>
        </div>
      </div>

      {/* Cart Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {cartItems && cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="glass p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-8 h-8 text-slate-600" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">Produto #{item.productId}</h3>
                        <p className="text-slate-400 text-sm mb-4">Quantidade: {item.quantity}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-bold">
                            R$ {(parseFloat(item.productId as any) * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <Card className="glass p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-white mb-4">Resumo</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Frete</span>
                      <span>R$ 0,00</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-white font-bold text-lg mb-6">
                    <span>Total</span>
                    <span className="text-cyan-400">R$ {total.toFixed(2)}</span>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-lg">
                    Finalizar Compra
                  </Button>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-6">Seu carrinho está vazio</p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                Continuar Comprando
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
