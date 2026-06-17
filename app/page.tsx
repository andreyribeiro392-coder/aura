'use client'

import { ShoppingCart, Heart, Zap, Truck, Shield, Star } from 'lucide-react'
import Link from 'next/link'
import Navigation from './components/Navigation'
import Footer from './components/Footer'

const CATEGORIES = [
  { name: 'Alimentos', icon: '🍔', slug: 'alimentos' },
  { name: 'Roupas', icon: '👕', slug: 'roupas' },
  { name: 'Acessórios', icon: '⌚', slug: 'acessorios' },
  { name: 'Ferramentas', icon: '🔧', slug: 'ferramentas' },
  { name: 'Tecnologia', icon: '💻', slug: 'tecnologia' },
  { name: 'Games', icon: '🎮', slug: 'games' },
  { name: 'Beleza', icon: '💄', slug: 'beleza' },
  { name: 'Casa & Decoração', icon: '🏠', slug: 'casa-decoracao' },
  { name: 'Esportes', icon: '⚽', slug: 'esportes' },
  { name: 'Pets', icon: '🐕', slug: 'pets' },
  { name: 'Livros', icon: '📚', slug: 'livros' },
  { name: 'Automotivo', icon: '🚗', slug: 'automotivo' },
]

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Notebook Gamer RTX 4090',
    price: '12.999,00',
    rating: 4.8,
    reviews: 245,
    category: 'Tecnologia',
    image: '🖥️',
  },
  {
    id: 2,
    name: 'PlayStation 5',
    price: '4.999,00',
    rating: 4.9,
    reviews: 512,
    category: 'Games',
    image: '🎮',
  },
  {
    id: 3,
    name: 'Smartwatch Ultra',
    price: '2.499,00',
    rating: 4.7,
    reviews: 189,
    category: 'Tecnologia',
    image: '⌚',
  },
  {
    id: 4,
    name: 'Fone Bluetooth Premium',
    price: '899,00',
    rating: 4.6,
    reviews: 423,
    category: 'Acessórios',
    image: '🎧',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 overflow-hidden mt-16"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(0, 255, 200, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Compre o <span className="gradient-text">Futuro</span> Hoje
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Descubra uma experiência de compra revolucionária com design futurista, produtos incríveis e tecnologia de ponta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categorias"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-lg flex items-center justify-center gap-2 transition-smooth"
              >
                <Zap size={20} />
                Explorar Agora
              </Link>
              <Link
                href="/admin"
                className="bg-slate-800/50 border border-cyan-500/50 text-cyan-300 hover:bg-slate-700/50 px-8 py-3 text-lg rounded-lg flex items-center justify-center gap-2 transition-smooth"
              >
                Admin
              </Link>
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Categorias</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="glass p-6 rounded-lg hover:neon-glow transition-smooth group cursor-pointer text-center"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-smooth">{category.icon}</div>
                <div className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-smooth">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Produtos em Destaque</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                className="glass rounded-lg hover:neon-glow transition-smooth group overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center text-6xl group-hover:scale-110 transition-smooth">
                  {product.image}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-smooth">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-slate-400 text-xs ml-2">({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold text-lg">R$ {product.price}</span>
                    <button className="bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 border border-cyan-500/50 p-2 rounded-lg transition-smooth">
                      <Heart size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/categorias"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-lg inline-block transition-smooth"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="glass p-12 rounded-lg text-center relative overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(0, 255, 200, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            }}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/30 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">🎉 Promoção Especial em Andamento!</h2>
              <p className="text-xl text-slate-300 mb-6">
                Aproveite descontos de até 50% em produtos selecionados. Válido por tempo limitado!
              </p>
              <Link
                href="/categorias"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 text-lg rounded-lg inline-block transition-smooth"
              >
                Ver Promoções
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de clientes satisfeitos e descubra o futuro do e-commerce
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categorias"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-lg flex items-center justify-center gap-2 transition-smooth"
            >
              <ShoppingCart size={20} />
              Começar a Comprar
            </Link>
            <Link
              href="/categorias"
              className="border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 px-8 py-3 text-lg rounded-lg transition-smooth"
            >
              Explorar Categorias
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
