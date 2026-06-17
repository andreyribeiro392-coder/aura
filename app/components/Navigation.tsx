'use client'

import { ShoppingCart, Heart, Search, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-neon-cyan/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold gradient-text">
          🚀 Marketplace Futurista
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/categorias" className="hover:text-neon-cyan transition-smooth">
            Categorias
          </Link>
          <Link href="/busca" className="hover:text-neon-cyan transition-smooth">
            Buscar
          </Link>
          <Link href="/admin" className="hover:text-neon-cyan transition-smooth">
            Admin
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-neon-cyan/10 rounded-lg transition-smooth">
            <Search size={20} />
          </button>
          <Link href="/carrinho" className="p-2 hover:bg-neon-cyan/10 rounded-lg transition-smooth relative">
            <ShoppingCart size={20} />
            <span className="absolute top-0 right-0 bg-neon-cyan text-slate-900 text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </Link>
          <Link href="/favoritos" className="p-2 hover:bg-neon-cyan/10 rounded-lg transition-smooth">
            <Heart size={20} />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-neon-cyan/10 rounded-lg transition-smooth"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-neon-cyan/20 p-4 space-y-2">
          <Link href="/categorias" className="block py-2 hover:text-neon-cyan transition-smooth">
            Categorias
          </Link>
          <Link href="/busca" className="block py-2 hover:text-neon-cyan transition-smooth">
            Buscar
          </Link>
          <Link href="/admin" className="block py-2 hover:text-neon-cyan transition-smooth">
            Admin
          </Link>
        </div>
      )}
    </nav>
  )
}
