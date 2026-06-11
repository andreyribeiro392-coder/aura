import React, { useState, useRef, useEffect } from 'react';

export default function ChatIA({ user }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: `Bem-vindo de volta, operador. Nível de acesso: ${user.plan}. Como posso otimizar seu físico hoje?` }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      let aiText = "🤖 Análise concluída. Mantenha os treinos intensos.";
      if (user.plan === 'FREE') {
        aiText += " (Faça upgrade para o plano Premium para receber a planilha completa de Bio-Hack).";
      } else {
        aiText = "🔥 [MENSAGEM PREMIUM] Seu protocolo foi recalculado com Inteligência Preditiva. Adicione 5g de Creatina e aumente a carga em 15% nas últimas duas séries.";
      }
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
    }, 1000);
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-status"><span className="pulse-dot"></span> MATRIX CARDIOVASCULAR</div>
      <div className="chat-box">
        {messages.map(m => (
          <div key={m.id} className={`message-row ${m.sender}`}>
            <div className="message-bubble">{m.text}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="chat-input-area">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Digite seu comando biomecânico..." />
        <button type="submit">PROCESSAR</button>
      </form>
    </div>
  );
}