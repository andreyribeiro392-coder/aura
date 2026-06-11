import React from 'react';

export default function Login({ setUser, setCurrentTab }) {
  return (
    <div className="cyber-card login-card">
      <h3>INICIALIZAR SESSÃO NEURAL</h3>
      <input type="email" placeholder="CÓDIGO DE ACESSO (EMAIL)" defaultValue="user@cybergym.com" />
      <input type="password" placeholder="CHAVE DE CRIPTOGRAFIA (SENHA)" defaultValue="123456" />
      <button onClick={() => {
        setUser(prev => ({ ...prev, isLoggedIn: true }));
        setCurrentTab('home');
      }}>AUTENTICAR VIA FIREBASE</button>
    </div>
  );
}