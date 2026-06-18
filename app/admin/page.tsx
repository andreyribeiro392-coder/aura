'use client'

import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function Admin() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-12">Painel Administrativo</h1>
          <div className="glass p-8 rounded-lg">
            <p className="text-slate-400">Aqui você pode gerenciar produtos, categorias e pedidos.</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
