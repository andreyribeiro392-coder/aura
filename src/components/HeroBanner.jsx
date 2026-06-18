import React from 'react';

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      {/* Aqui você pode trocar a URL por um link de vídeo em looping ou GIF futurista */}
      <div className="hero-video-overlay"></div>
      <img 
        className="hero-bg-media" 
        src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcXN3bHFrY3I5ZGd4cnB5ZXE1YTI3cm96ZjNxaW96Zms5b3E2ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oThv76fCOv7UFAVbi/giphy.gif" 
        alt="Futuristic Motion Background"
      />
      <div className="hero-content">
        <h2>CENTRAL DE COMANDO GEMINI-GYM</h2>
        <p>Otimize sua biologia através de algoritmos de inteligência artificial quântica.</p>
      </div>
    </div>
  );
}