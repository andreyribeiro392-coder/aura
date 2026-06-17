'use client'

import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function Carrinho() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-12">Seu Carrinho</h1>
          <div className="glass p-8 rounded-lg text-center">
            <p className="text-slate-300 text-lg">Seu carrinho está vazio</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
