import React from 'react';

export default function Perfil({ user, setUser, setCurrentTab }) {
  return (
    <div className="cyber-card perfil-card">
      <div className="profile-header">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Avatar" />
        <h2>{user.name}</h2>
        <span className={`plan-status-badge ${user.plan.toLowerCase()}`}>NÍVEL: {user.plan}</span>
      </div>
      <div className="profile-details">
        <p><strong>Bio-Link:</strong> {user.email}</p>
        <p><strong>Sincronização:</strong> Firebase Ativo</p>
      </div>
      <button className="logout-btn" onClick={() => {
        setUser({ name: '', email: '', isLoggedIn: false, plan: 'FREE' });
        setCurrentTab('home');
      }}>DESCONECTAR MATRIX</button>
    </div>
  );
}