import React from 'react';

export default function Navbar({ currentTab, setCurrentTab, user }) {
  return (
    <nav className="cyber-navbar">
      <div className="nav-logo" onClick={() => setCurrentTab('home')}>
        CYBER<span>GYM</span>
      </div>
      <div className="nav-links">
        <button 
          className={currentTab === 'home' ? 'active' : ''} 
          onClick={() => setCurrentTab('home')}
        >
          SISTEMA IA
        </button>
        <button 
          className={currentTab === 'planos' ? 'active' : ''} 
          onClick={() => setCurrentTab('planos')}
        >
          EVOLUÇÃO (PLANOS)
        </button>
        
        {user.isLoggedIn ? (
          <div className="nav-profile-badge" onClick={() => setCurrentTab('perfil')}>
            <span className={`plan-tag ${user.plan.toLowerCase()}`}>{user.plan}</span>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Perfil" />
          </div>
        ) : (
          <button className="login-btn" onClick={() => setCurrentTab('login')}>CONECTAR</button>
        )}
      </div>
    </nav>
  );
}