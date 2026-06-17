import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Check if user is admin
  if (!isAuthenticated || user?.email !== "andreyribeiro392@gmail.com") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Acesso negado. Apenas administradores podem acessar este painel.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-cyan-400 hover:text-cyan-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {showAddForm && (
            <Card className="glass p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Adicionar Novo Produto</h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Nome do Produto</label>
                    <input
                      type="text"
                      placeholder="Ex: Notebook Gamer"
                      className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Preço</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Categoria</label>
                  <select className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
                    <option value="">Selecione uma categoria</option>
                    <option value="alimentos">Alimentos</option>
                    <option value="roupas">Roupas</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="ferramentas">Ferramentas</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="games">Games</option>
                    <option value="beleza">Beleza</option>
                    <option value="casa-decoracao">Casa & Decoração</option>
                    <option value="esportes">Esportes</option>
                    <option value="pets">Pets</option>
                    <option value="livros">Livros</option>
                    <option value="automotivo">Automotivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Descrição</label>
                  <textarea
                    placeholder="Descrição detalhada do produto..."
                    rows={4}
                    className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Estoque</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">URL da Imagem</label>
                    <input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg"
                  >
                    Salvar Produto
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 px-8 py-2 rounded-lg"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Products List */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Produtos Cadastrados</h2>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="glass p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Produto #{i}</h3>
                      <p className="text-slate-400 text-sm">Categoria • R$ 99,90 • 10 em estoque</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
