'use client'

export default function Footer() {
  return (
    <footer className="border-t border-neon-cyan/20 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-4">Sobre</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Carreiras</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Suporte</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Contato</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">FAQ</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Suporte</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Políticas</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Privacidade</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Termos</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Devoluções</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Redes Sociais</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Facebook</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Instagram</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-smooth">Twitter</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neon-cyan/20 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2026 Marketplace Futurista. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
