import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente de compras. Posso ajudá-lo a encontrar produtos, comparar opções e responder suas dúvidas. Como posso ajudar?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in production, this would call your API)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("recomend") || lowerInput.includes("sugest")) {
      return "Com prazer! 🎯 Baseado em suas preferências, recomendo explorar nossas categorias de Tecnologia e Games, que têm produtos incríveis com ótimas avaliações. Qual dessas categorias te interessa?";
    }

    if (lowerInput.includes("compar") || lowerInput.includes("diferença")) {
      return "Ótima pergunta! 📊 Posso ajudá-lo a comparar produtos. Qual é o nome ou categoria dos produtos que deseja comparar?";
    }

    if (lowerInput.includes("preço") || lowerInput.includes("caro") || lowerInput.includes("barato")) {
      return "💰 Temos opções para todos os orçamentos! Use nossos filtros de faixa de preço na busca avançada para encontrar exatamente o que procura. Quer que eu recomende algo em uma faixa de preço específica?";
    }

    if (lowerInput.includes("entrega") || lowerInput.includes("frete") || lowerInput.includes("tempo")) {
      return "🚚 Oferecemos entrega rápida em até 24 horas para a maioria dos produtos! Frete grátis em compras acima de R$ 100. Tem alguma dúvida específica sobre entrega?";
    }

    if (lowerInput.includes("pagamento") || lowerInput.includes("pagar")) {
      return "💳 Aceitamos vários métodos de pagamento incluindo cartão de crédito, débito e pix. Todas as transações são seguras e criptografadas. Alguma dúvida sobre formas de pagamento?";
    }

    if (lowerInput.includes("devolução") || lowerInput.includes("trocar") || lowerInput.includes("garantia")) {
      return "🔄 Temos uma política de devolução de 30 dias sem complicações! Se não estiver satisfeito, é só solicitar a devolução. Qual é seu produto?";
    }

    return "Entendi sua pergunta! 🤔 Posso ajudá-lo com recomendações de produtos, comparações, informações sobre entrega, pagamento ou políticas de devolução. O que você gostaria de saber?";
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full glass hover:neon-glow transition-smooth shadow-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-cyan-400" />
        ) : (
          <MessageCircle className="w-6 h-6 text-cyan-400" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-40 w-96 max-h-96 glass flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/30 p-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              Assistente de Compras
            </h3>
            <p className="text-slate-400 text-sm">Sempre pronto para ajudar!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-cyan-500/30 text-cyan-100 border border-cyan-500/50"
                      : "bg-slate-800/50 text-slate-200 border border-slate-700/50"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 text-slate-200 border border-slate-700/50 px-4 py-2 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-700/50 p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-sm"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 border border-cyan-500/50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
