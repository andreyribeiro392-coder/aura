'use client'

import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Link from 'next/link'

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

export default function Categorias() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-12 text-center">Todas as Categorias</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="glass p-8 rounded-lg hover:neon-glow transition-smooth text-center">
                <div className="text-6xl mb-4">{cat.icon}</div>
                <div className="text-white font-semibold">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
