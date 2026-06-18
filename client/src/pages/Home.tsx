import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShoppingCart, Heart, Zap, Truck, Shield, Star } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const CATEGORIES = [
  { name: "Alimentos", icon: "🍔", slug: "alimentos" },
  { name: "Roupas", icon: "👕", slug: "roupas" },
  { name: "Acessórios", icon: "⌚", slug: "acessorios" },
  { name: "Ferramentas", icon: "🔧", slug: "ferramentas" },
  { name: "Tecnologia", icon: "💻", slug: "tecnologia" },
  { name: "Games", icon: "🎮", slug: "games" },
  { name: "Beleza", icon: "💄", slug: "beleza" },
  { name: "Casa & Decoração", icon: "🏠", slug: "casa-decoracao" },
  { name: "Esportes", icon: "⚽", slug: "esportes" },
  { name: "Pets", icon: "🐕", slug: "pets" },
  { name: "Livros", icon: "📚", slug: "livros" },
  { name: "Automotivo", icon: "🚗", slug: "automotivo" },
];

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Notebook Gamer RTX 4090",
    price: "12.999,00",
    rating: 4.8,
    reviews: 245,
    category: "Tecnologia",
    image: "🖥️",
  },
  {
    id: 2,
    name: "PlayStation 5",
    price: "4.999,00",
    rating: 4.9,
    reviews: 512,
    category: "Games",
    image: "🎮",
  },
  {
    id: 3,
    name: "Smartwatch Ultra",
    price: "2.499,00",
    rating: 4.7,
    reviews: 189,
    category: "Tecnologia",
    image: "⌚",
  },
  {
    id: 4,
    name: "Fone Bluetooth Premium",
    price: "899,00",
    rating: 4.6,
    reviews: 423,
    category: "Acessórios",
    image: "🎧",
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section
        className="relative py-32 px-4 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0, 255, 200, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Compre o <span className="gradient-text">Futuro</span> Hoje
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Descubra uma experiência de compra revolucionária com design futurista, produtos incríveis e tecnologia de ponta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/search")}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Explorar Agora
              </Button>
              {!isAuthenticated && (
                <a
                  href={getLoginUrl()}
                  className="bg-slate-800/50 border border-cyan-500/50 text-cyan-300 hover:bg-slate-700/50 px-8 py-3 text-lg rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Fazer Login
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="glass p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">50K+</div>
              <div className="text-slate-300">Produtos Disponíveis</div>
            </div>
            <div className="glass p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">100K+</div>
              <div className="text-slate-300">Clientes Satisfeitos</div>
            </div>
            <div className="glass p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">24h</div>
              <div className="text-slate-300">Entrega Rápida</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Categorias</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.slug}
                onClick={() => navigate(`/categoria/${category.slug}`)}
                className="glass p-6 rounded-lg hover:neon-glow transition-smooth group cursor-pointer text-center"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                <div className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors">
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Produtos em Destaque</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <Card
                key={product.id}
                onClick={() => navigate(`/produto/${product.id}`)}
                className="glass cursor-pointer hover:neon-glow transition-smooth group overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  {product.image}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                    <span className="text-slate-400 text-xs ml-2">({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold text-lg">R$ {product.price}</span>
                    <Button
                      size="icon"
                      className="bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 border border-cyan-500/50"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate("/search")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-lg"
            >
              Ver Todos os Produtos
            </Button>
          </div>
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div
            className="glass p-12 rounded-lg text-center relative overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(0, 255, 200, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
            }}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/30 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">🎉 Promoção Especial em Andamento!</h2>
              <p className="text-xl text-slate-300 mb-6">
                Aproveite descontos de até 50% em produtos selecionados. Válido por tempo limitado!
              </p>
              <Button
                onClick={() => navigate("/search")}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 text-lg rounded-lg"
              >
                Ver Promoções
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-lg text-center hover:neon-glow transition-smooth">
              <Truck className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Entrega Rápida</h3>
              <p className="text-slate-400">Receba seus produtos em até 24 horas em todo o Brasil</p>
            </div>

            <div className="glass p-8 rounded-lg text-center hover:neon-glow transition-smooth">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Compra Segura</h3>
              <p className="text-slate-400">Todas as transações são 100% seguras e criptografadas</p>
            </div>

            <div className="glass p-8 rounded-lg text-center hover:neon-glow transition-smooth">
              <ShoppingCart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Melhor Preço</h3>
              <p className="text-slate-400">Garantimos os melhores preços do mercado com qualidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de clientes satisfeitos e descubra o futuro do e-commerce
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/search")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-lg flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Começar a Comprar
            </Button>
            <Button
              onClick={() => navigate("/search")}
              variant="outline"
              className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 px-8 py-3 text-lg rounded-lg"
            >
              Explorar Categorias
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 px-4 mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Sobre</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Políticas</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Devoluções</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Redes Sociais</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 Marketplace Futurista. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
