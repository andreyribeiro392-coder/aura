'use client'

import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function Busca() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-12">Buscar Produtos</h1>
          <div className="glass p-8 rounded-lg">
            <input type="text" placeholder="Buscar produtos..." className="w-full bg-slate-800 text-white p-3 rounded-lg border border-neon-cyan/30 focus:border-neon-cyan outline-none" />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
