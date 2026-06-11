import React from 'react';

export default function Planos({ currentPlan, onUpgrade }) {
  return (
    <div className="planos-container">
      <div className="cyber-card price-card">
        <h4>PROTOCOLO FREE</h4>
        <p className="price">$0</p>
        <ul>
          <li>Acesso ao chat básico de IA</li>
          <li>Respostas com tempo de espera</li>
        </ul>
        <button disabled={currentPlan === 'FREE'} onClick={() => onUpgrade('FREE')}>
          {currentPlan === 'FREE' ? 'ATIVO' : 'SELECIONAR'}
        </button>
      </div>

      <div className="cyber-card price-card premium">
        <div className="premium-tag">RECOMENDADO</div>
        <h4>CYBER PREMIUM</h4>
        <p className="price">$29<span>/mês</span></p>
        <ul>
          <li>Dicas avançadas de Bio-hacking</li>
          <li>Gráficos de evolução em tempo real</li>
          <li>Suporte prioritário do Core Quantum</li>
        </ul>
        <button onClick={() => onUpgrade('PREMIUM')}>
          {currentPlan === 'PREMIUM' ? 'PLANO ATUAL' : 'FAZER UPGRADE'}
        </button>
      </div>
    </div>
  );
}