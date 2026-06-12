import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db } from './services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs, addDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import './styles/index.css';

const VideoBackground = () => (
  <div className="video-background">
    <video autoPlay loop muted playsInline>
      <source src="https://videos.pexels.com/video-files/5329767/5329767-uhd_2160_3840_25fps.mp4" type="video/mp4" />
    </video>
    <div className="video-overlay"></div>
  </div>
);

const AudioPlayer = () => {
  const tracks = [
    { name: "Workout Energy", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", category: "Treino" },
    { name: "Cardio Beat", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", category: "Cardio" },
    { name: "Focus Flow", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", category: "Concentração" },
    { name: "Power Lift", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", category: "Musculação" },
    { name: "Relax Cool", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", category: "Relaxamento" },
    { name: "HIIT Intense", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", category: "HIIT" },
    { name: "Yoga Zen", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", category: "Yoga" },
    { name: "Running Pace", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", category: "Corrida" },
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateProgress = () => {
      if (audioElement.duration) {
        setProgress((audioElement.currentTime / audioElement.duration) * 100);
      }
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.volume = volume;

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
    };
  }, [volume]);

  const toggleAudio = async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    try {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        await audioElement.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
    }
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setProgress(0);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e) => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioElement.duration) return;
    
    const seekTime = (parseFloat(e.target.value) / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
    setProgress(parseFloat(e.target.value));
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    selectTrack(nextIndex);
  };

  const prevTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    selectTrack(prevIndex);
  };

  return (
    <div className="audio-player-wrapper">
      <audio 
        ref={audioRef} 
        src={tracks[currentTrackIndex].url} 
        onEnded={nextTrack}
        onError={(e) => console.error("Erro no áudio:", e)}
      />
      
      <div className="audio-controls">
        <button 
          className="audio-control-btn"
          onClick={prevTrack}
          title="Anterior"
        >
          ⏮️
        </button>
        
        <button 
          className={`audio-play-btn ${isPlaying ? 'playing' : ''}`} 
          onClick={toggleAudio}
          title={isPlaying ? "Pausar" : "Tocar"}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button 
          className="audio-control-btn"
          onClick={nextTrack}
          title="Próximo"
        >
          ⏭️
        </button>
        
        <button 
          className="directory-toggle"
          onClick={() => setShowDirectory(!showDirectory)}
          title="Playlist"
        >
          {showDirectory ? '✖️' : '🎵'}
        </button>
      </div>

      <div className="audio-progress">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleSeek}
          className="progress-slider"
        />
      </div>

      <div className="audio-volume">
        <span>🔊</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume} 
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>

      {showDirectory && (
        <div className="music-directory">
          <div className="directory-header">
            <h4>🎵 Playlist Fitness</h4>
            <button onClick={() => setShowDirectory(false)} className="close-directory">✕</button>
          </div>
          <div className="playlist-categories">
            {['Todos', 'Treino', 'Cardio', 'Concentração', 'Relaxamento', 'HIIT', 'Yoga', 'Corrida'].map((cat) => (
              <button key={cat} className="category-tag">{cat}</button>
            ))}
          </div>
          <ul className="playlist-tracks">
            {tracks.map((track, index) => (
              <li 
                key={index} 
                className={`track-item ${currentTrackIndex === index ? 'active' : ''}`}
                onClick={() => selectTrack(index)}
              >
                <span className="track-number">{index + 1}</span>
                <div className="track-info">
                  <span className="track-name">{track.name}</span>
                  <span className="track-category">{track.category}</span>
                </div>
                {currentTrackIndex === index && isPlaying && <span className="playing-indicator">🔊</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PIX PAYLOAD (BR Code / EMV) - Nubank Chave Aleatória
// ============================================================
function buildPixPayload(chave, nomeRecebedor, cidade, valor, descricao, txid) {
  function crc16(data) {
    let crc = 0xFFFF;
    const poly = 0x1021;
    for (let i = 0; i < data.length; i++) {
      let byte = data.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        if ((crc ^ (byte << 8)) & 0x8000) crc = ((crc << 1) ^ poly) & 0xFFFF;
        else crc = (crc << 1) & 0xFFFF;
        byte <<= 1;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  function tlv(tag, value) { return `${tag}${String(value.length).padStart(2,'0')}${value}`; }

  const gui = 'BR.GOV.BCB.PIX';
  const maiContent = tlv('00', gui) + tlv('01', chave) + (descricao ? tlv('02', descricao.slice(0,25)) : '');
  const mai = tlv('26', maiContent);
  const additionalData = tlv('62', tlv('05', (txid || '***').slice(0,25)));
  const amountField = valor != null ? tlv('54', valor.toFixed(2)) : '';

  const payload =
    tlv('00','01') + tlv('01','12') + mai +
    tlv('52','0000') + tlv('53','986') + amountField +
    tlv('58','BR') + tlv('59', nomeRecebedor.slice(0,25)) +
    tlv('60', cidade.slice(0,15)) + additionalData + '6304';

  return payload + crc16(payload);
}

const PIX_PAYLOAD = buildPixPayload(
  '97a0035e-8fcf-42f5-9f33-2cf184db987f',
  'AuraFit Pro',
  'Brasil',
  9.99,
  'AuraFit PRO',
  'AURAFIT999'
);

// ============================================================
// GALERIA DE VÍDEOS DE ANIMAÇÃO 3D (ATUALIZADO - URLs VERIFICADOS)
// ============================================================
const HIGHLIGHT_VIDEOS = [
  { id: 1, title: "Agachamento (Squat)", url: "https://videos.pexels.com/video-files/5329767/5329767-uhd_2160_3840_25fps.mp4", category: "Pernas 3D" },
  { id: 2, title: "Flexão (Push Up)", url: "https://videos.pexels.com/video-files/5329765/5329765-uhd_2160_3840_25fps.mp4", category: "Peito 3D" },
  { id: 3, title: "Abdominal (Crunch)", url: "https://videos.pexels.com/video-files/5329766/5329766-uhd_2160_3840_25fps.mp4", category: "Core 3D" },
  { id: 4, title: "Burpee", url: "https://videos.pexels.com/video-files/5329768/5329768-uhd_2160_3840_25fps.mp4", category: "Full Body 3D" },
  { id: 5, title: "Alongamento", url: "https://videos.pexels.com/video-files/5329769/5329769-uhd_2160_3840_25fps.mp4", category: "Flexibilidade 3D" },
  { id: 6, title: "Corrida (Running)", url: "https://videos.pexels.com/video-files/5329770/5329770-uhd_2160_3840_25fps.mp4", category: "Cardio 3D" },
  { id: 7, title: "Remada (Rowing)", url: "https://videos.pexels.com/video-files/5329771/5329771-uhd_2160_3840_25fps.mp4", category: "Costas 3D" },
  { id: 8, title: "Salto (Jump)", url: "https://videos.pexels.com/video-files/5329772/5329772-uhd_2160_3840_25fps.mp4", category: "Explosão 3D" },
  { id: 9, title: "Elevação Lateral", url: "https://videos.pexels.com/video-files/5329773/5329773-uhd_2160_3840_25fps.mp4", category: "Ombros 3D" },
  { id: 10, title: "Polichinelo", url: "https://videos.pexels.com/video-files/5329774/5329774-uhd_2160_3840_25fps.mp4", category: "Aquecimento 3D" },
  { id: 11, title: "Avanço (Lunge)", url: "https://videos.pexels.com/video-files/5329775/5329775-uhd_2160_3840_25fps.mp4", category: "Pernas 3D" },
  { id: 12, title: "Prancha (Plank)", url: "https://videos.pexels.com/video-files/5329776/5329776-uhd_2160_3840_25fps.mp4", category: "Core 3D" },
];

// ============================================================
// DADOS DE TREINOS EM CASA
// ============================================================
const HOME_WORKOUTS = [
  {
    id: 1, name: 'Aquecimento Leve', level: 'Iniciante', muscleGroup: 'Full Body',
    duration: '10 min', difficulty: 1, image: '🏃',
    description: 'Prepare seu corpo para o treino com movimentos suaves que elevam a temperatura corporal e ativam as articulações. Ideal para iniciar qualquer sessão de exercícios.',
    benefits: ['Previne lesões', 'Ativa o sistema cardiovascular', 'Melhora a mobilidade articular'],
    exercises: [
      { name: 'Corrida no Lugar', reps: '2 min', rest: '30s', tip: 'Mantenha os joelhos levantados na altura do quadril. Respire de forma rítmica.' },
      { name: 'Alongamento Dinâmico', reps: '2 min', rest: '30s', tip: 'Movimentos controlados. Não force além do limite confortável.' },
      { name: 'Mobilidade Articular', reps: '2 min', rest: '30s', tip: 'Rotacione ombros, quadril e tornozelos em círculos amplos.' },
      { name: 'Polichinelo Leve', reps: '1 min', rest: '30s', tip: 'Ritmo moderado, foco na coordenação dos braços e pernas.' },
    ],
  },
  {
    id: 2, name: 'Flexões para Iniciantes', level: 'Iniciante', muscleGroup: 'Peito',
    duration: '15 min', difficulty: 1, image: '💪',
    description: 'Desenvolva força no peito, ombros e tríceps com variações acessíveis de flexão. Perfeito para quem está começando a treinar em casa.',
    benefits: ['Fortalece peito e tríceps', 'Melhora postura', 'Sem equipamento necessário'],
    exercises: [
      { name: 'Flexão na Parede', reps: '3x10', rest: '60s', tip: 'Posicione as mãos na altura dos ombros. Mantenha o corpo reto como uma prancha.' },
      { name: 'Flexão de Joelhos', reps: '3x8', rest: '60s', tip: 'Apoie os joelhos no chão. Desça o peito até quase tocar o chão.' },
      { name: 'Flexão Normal', reps: '2x5', rest: '60s', tip: 'Tente a versão completa. Se não conseguir, volte para a de joelhos.' },
      { name: 'Alongamento de Peito', reps: '2x30s', rest: '30s', tip: 'Abra os braços em T e sinta o alongamento no peito.' },
    ],
  },
  {
    id: 3, name: 'Agachamento Básico', level: 'Iniciante', muscleGroup: 'Pernas',
    duration: '12 min', difficulty: 1, image: '🦵',
    description: 'Fortaleça quadríceps, glúteos e isquiotibiais com o exercício mais fundamental para membros inferiores. Técnica correta é essencial.',
    benefits: ['Fortalece pernas e glúteos', 'Melhora equilíbrio', 'Queima muitas calorias'],
    exercises: [
      { name: 'Agachamento Assistido', reps: '3x12', rest: '60s', tip: 'Segure em uma cadeira para equilíbrio. Joelhos alinhados com os pés.' },
      { name: 'Agachamento Livre', reps: '3x10', rest: '60s', tip: 'Pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão.' },
      { name: 'Afundo Alternado', reps: '3x10', rest: '60s', tip: 'Passo largo à frente. Joelho traseiro quase toca o chão.' },
      { name: 'Alongamento de Pernas', reps: '2x30s', rest: '30s', tip: 'Segure cada posição por 30 segundos sem balançar.' },
    ],
  },
  {
    id: 4, name: 'Abdominais Iniciante', level: 'Iniciante', muscleGroup: 'Abdômen',
    duration: '10 min', difficulty: 1, image: '⚡',
    description: 'Construa um core forte com exercícios abdominais progressivos. Um core forte melhora a postura e previne dores nas costas.',
    benefits: ['Fortalece o core', 'Melhora postura', 'Reduz dores nas costas'],
    exercises: [
      { name: 'Abdominal Deitado', reps: '3x15', rest: '45s', tip: 'Mãos atrás da cabeça, cotovelos abertos. Suba apenas os ombros do chão.' },
      { name: 'Prancha Estática', reps: '3x20s', rest: '45s', tip: 'Corpo reto como uma tábua. Não deixe o quadril subir ou descer.' },
      { name: 'Elevação de Pernas', reps: '3x10', rest: '45s', tip: 'Deitado, eleve as pernas juntas até 90°. Controle a descida.' },
      { name: 'Respiração Abdominal', reps: '2x30s', rest: '30s', tip: 'Inspire pelo nariz inflando o abdômen, expire pela boca contraindo.' },
    ],
  },
  {
    id: 5, name: 'Costas Iniciante', level: 'Iniciante', muscleGroup: 'Costas',
    duration: '12 min', difficulty: 1, image: '🔙',
    description: 'Fortaleça a musculatura das costas para melhorar postura e prevenir lesões. Exercícios seguros para iniciantes sem equipamento.',
    benefits: ['Melhora postura', 'Previne dores nas costas', 'Fortalece coluna'],
    exercises: [
      { name: 'Superman Leve', reps: '3x10', rest: '60s', tip: 'Deitado de bruços, eleve braços e pernas simultaneamente. Segure 2 segundos.' },
      { name: 'Remada Inversa na Parede', reps: '3x12', rest: '60s', tip: 'Incline o corpo para trás segurando uma superfície firme. Puxe o peito para ela.' },
      { name: 'Gato-Vaca', reps: '3x10', rest: '45s', tip: 'De quatro apoios, alterne arqueando e curvando a coluna lentamente.' },
      { name: 'Alongamento de Costas', reps: '2x30s', rest: '30s', tip: 'Abrace os joelhos no peito deitado. Sinta o alongamento na lombar.' },
    ],
  },
  {
    id: 6, name: 'Braços Iniciante', level: 'Iniciante', muscleGroup: 'Bíceps',
    duration: '10 min', difficulty: 1, image: '💪',
    description: 'Desenvolva bíceps e tríceps com exercícios simples usando garrafas d\'água ou qualquer objeto com peso.',
    benefits: ['Tonifica braços', 'Aumenta força funcional', 'Sem equipamento específico'],
    exercises: [
      { name: 'Rosca com Garrafa', reps: '3x12', rest: '45s', tip: 'Use garrafas de 1-2L. Cotovelo fixo ao lado do corpo. Suba e desça controlado.' },
      { name: 'Tríceps na Parede', reps: '3x10', rest: '45s', tip: 'Mãos na parede abaixo dos ombros. Flexione os cotovelos dobrando os braços.' },
      { name: 'Extensão de Tríceps', reps: '3x10', rest: '45s', tip: 'Segure uma garrafa com ambas as mãos atrás da cabeça. Estenda os cotovelos.' },
      { name: 'Alongamento de Braços', reps: '2x30s', rest: '30s', tip: 'Puxe o braço estendido horizontalmente contra o peito. Sinta o ombro.' },
    ],
  },
  {
    id: 7, name: 'Cardio Leve', level: 'Iniciante', muscleGroup: 'Cardio',
    duration: '15 min', difficulty: 1, image: '🏃',
    description: 'Melhore sua resistência cardiovascular com exercícios de baixo impacto. Ótimo para queimar calorias e melhorar a saúde do coração.',
    benefits: ['Melhora condicionamento', 'Queima calorias', 'Fortalece coração'],
    exercises: [
      { name: 'Caminhada Rápida', reps: '5 min', rest: '1 min', tip: 'Mantenha ritmo acelerado. Braços balançando naturalmente.' },
      { name: 'Polichinelo Leve', reps: '3x15', rest: '60s', tip: 'Pule abrindo braços e pernas simultaneamente. Pouso suave.' },
      { name: 'Marcha Elevada', reps: '2 min', rest: '30s', tip: 'Eleve os joelhos alternadamente como se marchasse. Braços acompanham.' },
      { name: 'Recuperação Ativa', reps: '2 min', rest: '30s', tip: 'Caminhada lenta com respiração profunda para normalizar frequência cardíaca.' },
    ],
  },
  {
    id: 8, name: 'Full Body Iniciante', level: 'Iniciante', muscleGroup: 'Full Body',
    duration: '20 min', difficulty: 1, image: '🏋️',
    description: 'Treino completo que trabalha todos os grupos musculares em uma única sessão. Eficiente para iniciantes que querem resultados rápidos.',
    benefits: ['Trabalha todo o corpo', 'Eficiente em tempo', 'Queima máxima de calorias'],
    exercises: [
      { name: 'Aquecimento', reps: '3 min', rest: '30s', tip: 'Movimentos leves para elevar a temperatura corporal.' },
      { name: 'Agachamento', reps: '3x12', rest: '60s', tip: 'Foco na técnica. Joelhos não ultrapassam os pés.' },
      { name: 'Flexão de Joelhos', reps: '3x8', rest: '60s', tip: 'Desça devagar (2s), suba rápido (1s).' },
      { name: 'Abdominal', reps: '3x15', rest: '45s', tip: 'Contraia o abdômen durante todo o movimento.' },
      { name: 'Alongamento Final', reps: '2 min', rest: '30s', tip: 'Cada grupo muscular trabalhado merece 20-30s de alongamento.' },
    ],
  },
  {
    id: 9, name: 'Flexões Intermediárias', level: 'Intermediário', muscleGroup: 'Peito',
    duration: '18 min', difficulty: 2, image: '💪',
    description: 'Evolua seu treino de peito com variações mais desafiadoras de flexão. Desenvolva força, massa e definição muscular.',
    benefits: ['Aumenta massa muscular', 'Desenvolve força superior', 'Melhora definição'],
    exercises: [
      { name: 'Flexão Normal', reps: '4x12', rest: '60s', tip: 'Desça em 3 segundos, suba explosivo. Peito quase toca o chão.' },
      { name: 'Flexão Diamante', reps: '3x10', rest: '60s', tip: 'Mãos formando um diamante. Foco total no tríceps e peito interno.' },
      { name: 'Flexão com Pausa', reps: '3x8', rest: '60s', tip: 'Pause 2 segundos na posição mais baixa. Máxima tensão muscular.' },
      { name: 'Flexão Inclinada', reps: '3x10', rest: '60s', tip: 'Pés elevados em uma cadeira. Trabalha peito superior.' },
      { name: 'Alongamento', reps: '2x30s', rest: '30s', tip: 'Abra os braços e sinta o alongamento profundo no peito.' },
    ],
  },
  {
    id: 10, name: 'HIIT Intermediário', level: 'Intermediário', muscleGroup: 'Full Body',
    duration: '20 min', difficulty: 2, image: '⚡',
    description: 'Treino de alta intensidade intervalado que maximiza a queima de gordura e melhora o condicionamento cardiovascular em menos tempo.',
    benefits: ['Queima gordura acelerada', 'Efeito afterburn', 'Melhora VO2 máximo'],
    exercises: [
      { name: 'Aquecimento', reps: '2 min', rest: '30s', tip: 'Prepare o corpo. Frequência cardíaca moderada.' },
      { name: 'Burpee', reps: '8x: 30s ON / 30s OFF', rest: '2 min', tip: 'Máxima intensidade nos 30s ativos. Recuperação completa nos 30s de descanso.' },
      { name: 'Mountain Climber', reps: '4x30s', rest: '30s', tip: 'Joelhos alternados em direção ao peito. Quadril estável.' },
      { name: 'Salto com Agachamento', reps: '4x10', rest: '60s', tip: 'Agache fundo, salte explosivo, pouso suave com joelhos semiflexionados.' },
      { name: 'Recuperação', reps: '2 min', rest: '30s', tip: 'Caminhada lenta. Respire profundamente.' },
    ],
  },
  {
    id: 11, name: 'Agachamento Pistol', level: 'Avançado', muscleGroup: 'Pernas',
    duration: '22 min', difficulty: 3, image: '🦵',
    description: 'O agachamento unilateral mais desafiador. Desenvolve força, equilíbrio e mobilidade extremas em cada perna individualmente.',
    benefits: ['Força unilateral máxima', 'Equilíbrio avançado', 'Mobilidade de quadril'],
    exercises: [
      { name: 'Agachamento Pistol Assistido', reps: '4x6 cada', rest: '90s', tip: 'Segure uma superfície para equilíbrio. Desça controlado em uma perna.' },
      { name: 'Agachamento Pistol Livre', reps: '3x4 cada', rest: '120s', tip: 'Braços à frente para equilíbrio. Desça o máximo possível.' },
      { name: 'Agachamento Profundo com Pausa', reps: '4x12', rest: '90s', tip: 'Pause 3 segundos na posição mais baixa. Máxima ativação.' },
      { name: 'Salto com Agachamento', reps: '3x12', rest: '90s', tip: 'Explosão máxima no salto. Pouso suave e controlado.' },
      { name: 'Alongamento', reps: '2x30s', rest: '30s', tip: 'Foco em quadríceps e isquiotibiais após esforço intenso.' },
    ],
  },
  {
    id: 12, name: 'Full Body Avançado', level: 'Avançado', muscleGroup: 'Full Body',
    duration: '30 min', difficulty: 3, image: '🏋️',
    description: 'Treino completo de alta intensidade para atletas avançados. Combina força, potência e resistência em uma sessão devastadora.',
    benefits: ['Força máxima', 'Potência explosiva', 'Resistência muscular'],
    exercises: [
      { name: 'Aquecimento', reps: '3 min', rest: '30s', tip: 'Mobilidade completa. Ative cada grupo muscular.' },
      { name: 'Flexão com Uma Mão', reps: '3x6 cada', rest: '90s', tip: 'Pés abertos para equilíbrio. Desça devagar, suba explosivo.' },
      { name: 'Agachamento Pistol', reps: '3x6 cada', rest: '90s', tip: 'Controle total. Não use impulso.' },
      { name: 'Abdominal com Elevação de Perna', reps: '3x20', rest: '90s', tip: 'Pernas retas. Eleve até 90° e desça controlado.' },
      { name: 'Burpee Explosivo', reps: '3x12', rest: '90s', tip: 'Salto máximo. Palmas acima da cabeça no topo.' },
      { name: 'Alongamento', reps: '2 min', rest: '30s', tip: 'Recuperação completa. Cada músculo por 30s.' },
    ],
  },
  ...Array.from({ length: 50 }).map((_, i) => ({
    id: 13 + i,
    name: `Treino Casa ${i + 1}`,
    level: i % 3 === 0 ? 'Iniciante' : i % 3 === 1 ? 'Intermediário' : 'Avançado',
    muscleGroup: i % 5 === 0 ? 'Pernas' : i % 5 === 1 ? 'Braços' : i % 5 === 2 ? 'Core' : i % 5 === 3 ? 'Cardio' : 'Full Body',
    duration: `${10 + (i % 20)} min`,
    difficulty: (i % 3) + 1,
    image: ['🏠', '🔥', '⚡', '💪', '🦵'][i % 5],
    description: `Treino residencial focado em ${['queima de gordura', 'tonificação', 'força funcional', 'resistência', 'mobilidade'][i % 5]}.`,
    benefits: ['Sem equipamentos', 'Praticidade', 'Saúde'],
    exercises: [
      { name: 'Exercício 1', reps: '3x12', rest: '45s', tip: 'Mantenha a postura.' },
      { name: 'Exercício 2', reps: '3x10', rest: '45s', tip: 'Foco na contração.' },
      { name: 'Exercício 3', reps: '3x15', rest: '45s', tip: 'Controle a respiração.' },
    ]
  }))
];

// ============================================================
// DADOS DE TREINOS NA ACADEMIA
// ============================================================
const GYM_WORKOUTS = [
  { id: 101, name: 'Supino Reto', category: 'Peito', image: '💪', sets: 4, reps: '8-10', rest: '90s', description: 'Exercício fundamental para desenvolvimento do peito. Deite no banco, barra na altura do peito, desça controlado e empurre explosivo. Mantenha os pés no chão e as costas levemente arqueadas.' },
  { id: 102, name: 'Supino Inclinado', category: 'Peito', image: '💪', sets: 3, reps: '10-12', rest: '90s', description: 'Foca no peito superior e clavicular. Banco a 30-45°. Barra desce até a parte superior do peito. Excelente para dar volume ao peito alto.' },
  { id: 103, name: 'Crucifixo', category: 'Peito', image: '💪', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento do peito com halteres. Braços levemente flexionados, abra em arco amplo até sentir o alongamento, feche contraindo o peito. Não use peso excessivo.' },
  { id: 104, name: 'Barra Fixa', category: 'Costas', image: '🔙', sets: 4, reps: '8-12', rest: '120s', description: 'Rei dos exercícios para costas. Pegada pronada, puxe o peito até a barra. Escápulas retraídas durante todo o movimento. Se necessário, use elástico de assistência.' },
  { id: 105, name: 'Remada Curvada', category: 'Costas', image: '🔙', sets: 4, reps: '10-12', rest: '90s', description: 'Tronco inclinado a 45°, barra puxada até o abdômen. Cotovelos próximos ao corpo. Excelente para espessura das costas. Mantenha a coluna neutra.' },
  { id: 106, name: 'Desenvolvimento com Barra', category: 'Ombros', image: '🎯', sets: 4, reps: '8-10', rest: '90s', description: 'Exercício fundamental para deltoides. Barra na altura do queixo, empurre acima da cabeça. Não trave os cotovelos no topo. Core contraído para proteger a lombar.' },
  { id: 107, name: 'Elevação Lateral', category: 'Ombros', image: '🎯', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento do deltoide lateral. Halteres ao lado do corpo, eleve até a altura dos ombros com cotovelos levemente flexionados. Controle a descida.' },
  { id: 108, name: 'Rosca Direta', category: 'Bíceps', image: '💪', sets: 4, reps: '10-12', rest: '60s', description: 'Clássico para bíceps. Cotovelos fixos ao lado do corpo, suba a barra contraindo o bíceps, desça controlado. Não balance o tronco para ganhar impulso.' },
  { id: 109, name: 'Rosca Scott', category: 'Bíceps', image: '💪', sets: 3, reps: '10-12', rest: '60s', description: 'Isolamento máximo do bíceps. Apoie os tríceps no banco Scott, suba e desça controlado. Não estenda completamente para manter tensão.' },
  { id: 110, name: 'Tríceps Corda', category: 'Tríceps', image: '💪', sets: 3, reps: '12-15', rest: '60s', description: 'Extensão de tríceps no cabo com corda. Cotovelos fixos ao lado do corpo, estenda abrindo a corda no final para máxima contração. Controle a subida.' },
  { id: 111, name: 'Tríceps Francês', category: 'Tríceps', image: '💪', sets: 3, reps: '10-12', rest: '60s', description: 'Extensão de tríceps acima da cabeça com barra EZ ou haltere. Cotovelos apontados para cima, desça atrás da cabeça e estenda. Excelente para a cabeça longa do tríceps.' },
  { id: 112, name: 'Agachamento Livre', category: 'Pernas', image: '🦵', sets: 4, reps: '8-10', rest: '120s', description: 'Rei dos exercícios. Barra nas costas, pés na largura dos ombros, desça até as coxas ficarem paralelas ao chão. Joelhos alinhados com os pés. Core contraído.' },
  { id: 113, name: 'Leg Press', category: 'Pernas', image: '🦵', sets: 3, reps: '10-12', rest: '90s', description: 'Excelente para quadríceps e glúteos. Pés na plataforma na largura dos ombros, desça até 90° nos joelhos. Não trave os joelhos no topo. Varie a posição dos pés.' },
  { id: 114, name: 'Extensora', category: 'Pernas', image: '🦵', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento do quadríceps. Sente na máquina, estenda as pernas completamente contraindo o quadríceps, desça controlado. Pause 1 segundo no topo.' },
  { id: 115, name: 'Flexora', category: 'Pernas', image: '🦵', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento dos isquiotibiais. Deitado na máquina, flexione os joelhos trazendo os calcanhares aos glúteos. Controle a extensão. Essencial para equilíbrio muscular.' },
  { id: 116, name: 'Abdominal Máquina', category: 'Abdômen', image: '⚡', sets: 3, reps: '15-20', rest: '60s', description: 'Flexão do tronco na máquina específica. Ajuste o peso adequadamente, flexione o tronco contraindo o abdômen, não use o pescoço. Controle o retorno.' },
  { id: 117, name: 'Prancha', category: 'Abdômen', image: '⚡', sets: 3, reps: '45-60s', rest: '60s', description: 'Exercício isométrico para core completo. Apoie nos antebraços e pontas dos pés. Corpo reto, quadril alinhado. Respire normalmente. Aumente o tempo progressivamente.' },
  { id: 118, name: 'Esteira', category: 'Cardio', image: '🏃', sets: 1, reps: '20-30 min', rest: '2 min', description: 'Corrida ou caminhada na esteira. Varie a velocidade e inclinação para maior eficiência. Mantenha postura ereta, olhar à frente. Ideal para aquecimento ou finalização.' },
  { id: 119, name: 'Bicicleta Ergométrica', category: 'Cardio', image: '🏃', sets: 1, reps: '20-30 min', rest: '2 min', description: 'Cardio de baixo impacto articular. Ajuste o selim na altura correta. Varie a resistência. Excelente para recuperação ativa ou queima de gordura.' },
  ...Array.from({ length: 50 }).map((_, i) => ({
    id: 120 + i,
    name: `Exercício Academia ${i + 1}`,
    category: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Cardio'][i % 6],
    image: ['💪', '🔙', '🦵', '🎯', '💪', '🏃'][i % 6],
    sets: 3 + (i % 2),
    reps: '10-12',
    rest: '60s',
    description: `Exercício profissional de academia focado em hipertrofia e definição muscular.`
  }))
];

// ============================================================
// DADOS DE REFEIÇÕES
// ============================================================
const MEALS = [
  { id: 1, name: 'Ovos com Pão Integral', category: 'Café da manhã', image: '🥚', calories: 350, protein: 15, carbs: 35, fat: 12, ingredients: ['2 ovos', '2 fatias pão integral', 'manteiga light'] },
  { id: 2, name: 'Aveia com Frutas', category: 'Café da manhã', image: '🥣', calories: 300, protein: 10, carbs: 50, fat: 5, ingredients: ['1 xícara aveia', 'banana', 'morango', 'mel'] },
  { id: 3, name: 'Iogurte Grego com Granola', category: 'Café da manhã', image: '🥛', calories: 280, protein: 20, carbs: 30, fat: 8, ingredients: ['200ml iogurte grego', '50g granola', 'mel', 'frutas vermelhas'] },
  { id: 4, name: 'Smoothie Proteico', category: 'Café da manhã', image: '🥤', calories: 320, protein: 25, carbs: 35, fat: 6, ingredients: ['1 scoop whey', 'banana', '200ml leite', 'mel', 'aveia'] },
  { id: 5, name: 'Banana com Pasta de Amendoim', category: 'Lanche da manhã', image: '🍌', calories: 250, protein: 10, carbs: 30, fat: 12, ingredients: ['1 banana', '2 col pasta amendoim'] },
  { id: 6, name: 'Maçã com Castanhas', category: 'Lanche da manhã', image: '🍎', calories: 220, protein: 8, carbs: 25, fat: 10, ingredients: ['1 maçã', '30g castanha de caju'] },
  { id: 7, name: 'Frango com Arroz e Feijão', category: 'Almoço', image: '🍗', calories: 550, protein: 45, carbs: 60, fat: 10, ingredients: ['200g frango grelhado', '4 col arroz', '2 col feijão', 'salada'] },
  { id: 8, name: 'Salmão com Batata Doce', category: 'Almoço', image: '🐟', calories: 480, protein: 40, carbs: 45, fat: 15, ingredients: ['180g salmão', '200g batata doce', 'brócolis', 'limão'] },
  { id: 9, name: 'Whey com Fruta', category: 'Lanche da tarde', image: '🥤', calories: 200, protein: 22, carbs: 20, fat: 3, ingredients: ['1 scoop whey', '150ml água', '1 fruta'] },
  { id: 10, name: 'Omelete com Legumes', category: 'Jantar', image: '🍳', calories: 380, protein: 28, carbs: 15, fat: 22, ingredients: ['3 ovos', 'espinafre', 'tomate', 'queijo', 'azeite'] },
  { id: 11, name: 'Tilápia com Legumes', category: 'Jantar', image: '🐟', calories: 350, protein: 38, carbs: 20, fat: 8, ingredients: ['200g tilápia', 'abobrinha', 'cenoura', 'temperos'] },
  { id: 12, name: 'Iogurte com Mel', category: 'Ceia', image: '🥛', calories: 150, protein: 12, carbs: 18, fat: 3, ingredients: ['150ml iogurte natural', '1 col mel', 'canela'] },
  ...Array.from({ length: 50 }).map((_, i) => ({
    id: 13 + i,
    name: `Refeição Saudável ${i + 1}`,
    category: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'][i % 6],
    image: ['🥚', '🥜', '🍟', '🥗', '🌷', '🥦'][i % 6],
    calories: 200 + (i % 400),
    protein: 10 + (i % 30),
    carbs: 20 + (i % 40),
    fat: 5 + (i % 15),
    ingredients: [`Ingrediente ${i + 1}`, `Ingrediente ${i + 2}`, `Tempero`]
  }))
];

// ============================================================
// 40+ ESTILOS ALIMENTARES COMPLETOS
// ============================================================
const DIET_STYLES = [
  {
    id: 1, name: 'Hipertrofia', category: 'Ganho de Massa', image: '💪',
    description: 'Dieta focada em maximizar o ganho de massa muscular através de superávit calórico e alta ingestão proteica.',
    benefits: ['Máximo ganho muscular', 'Força aumentada', 'Recuperação otimizada', 'Metabolismo acelerado'],
    disadvantages: ['Pode ganhar gordura', 'Requer disciplina', 'Custo elevado', 'Digestão pesada'],
    targetAudience: 'Praticantes de musculação, atletas de força, pessoas com dificuldade em ganhar peso',
    exampleMeals: ['Omelete 4 ovos + aveia', 'Frango 200g + arroz integral', 'Whey + banana', 'Carne magra + batata doce'],
    macros: { protein: '2-2.5g/kg', carbs: '4-6g/kg', fat: '0.8-1g/kg' },
    objectives: 'Ganho de massa muscular, força, hipertrofia'
  },
  {
    id: 2, name: 'Emagrecimento', category: 'Perda de Peso', image: '🔥',
    description: 'Dieta com déficit calórico controlado para perda de gordura preservando massa muscular.',
    benefits: ['Perda de gordura', 'Definição muscular', 'Saúde cardiovascular', 'Energia estável'],
    disadvantages: ['Fome inicial', 'Redução de desempenho', 'Requer planejamento', 'Social restrito'],
    targetAudience: 'Pessoas com sobrepeso, atletas em cutting, quem busca definição',
    exampleMeals: ['Ovos claras + vegetais', 'Peixe grelhado + salada', 'Iogurte grego + frutas', 'Frango magro + legumes'],
    macros: { protein: '2-2.5g/kg', carbs: '1-3g/kg', fat: '0.5-0.8g/kg' },
    objectives: 'Perda de gordura, definição, composição corporal'
  },
  {
    id: 3, name: 'Low Carb', category: 'Baixo Carboidrato', image: '🥩',
    description: 'Redução drástica de carboidratos para forçar o corpo a usar gordura como fonte de energia.',
    benefits: ['Queima de gordura rápida', 'Controle de glicemia', 'Redução de apetite', 'Energia estável'],
    disadvantages: ['Gripe low carb inicial', 'Falta de energia para treinos', 'Restrição alimentar', 'Hálito cetônico'],
    targetAudience: 'Pessoas com resistência à insulina, quem busca perda rápida, sedentários',
    exampleMeals: ['Ovos + bacon', 'Carne + salada', 'Peixe + vegetais', 'Frango + abacate'],
    macros: { protein: '1.8-2.2g/kg', carbs: '<50g/dia', fat: '1-1.5g/kg' },
    objectives: 'Perda de peso, controle glicêmico, queima de gordura'
  },
  {
    id: 4, name: 'Cetogênica', category: 'Muito Baixo Carb', image: '🥑',
    description: 'Dieta extremamente baixa em carboidratos que induz cetose, usando gordura como principal fonte de energia.',
    benefits: ['Queima de gordura máxima', 'Clareza mental', 'Controle de apetite', 'Energia constante'],
    disadvantages: ['Adaptação difícil', 'Restrição severa', 'Risco de deficiências', 'Social limitado'],
    targetAudience: 'Pessoas com epilepsia, obesidade severa, atletas de endurance',
    exampleMeals: ['Ovos + abacate', 'Salmão + vegetais', 'Carne + queijo', 'Frango + azeite'],
    macros: { protein: '1.2-1.8g/kg', carbs: '<20g/dia', fat: '70-80% das calorias' },
    objectives: 'Cetose, queima de gordura, controle neurológico'
  },
  {
    id: 5, name: 'Mediterrânea', category: 'Estilo de Vida', image: '🫒',
    description: 'Padrão alimentar baseado nos países mediterrâneos, rico em azeite, peixes, vegetais e grãos integrais.',
    benefits: ['Saúde cardiovascular', 'Longevidade', 'Anti-inflamatório', 'Sustentável'],
    disadvantages: ['Pode ser calórica', 'Custo moderado', 'Requer planejamento', 'Acesso a ingredientes'],
    targetAudience: 'Todos os públicos, especialmente quem busca saúde e longevidade',
    exampleMeals: ['Peixe grelhado + azeite', 'Salada grega + nozes', 'Frango + legumes + azeite', 'Grãos integrais + azeite'],
    macros: { protein: '1.2-1.6g/kg', carbs: '3-5g/kg', fat: '1-1.5g/kg' },
    objectives: 'Saúde cardiovascular, longevidade, bem-estar geral'
  },
  {
    id: 6, name: 'Vegana', category: 'Plant-Based', image: '🥬',
    description: 'Exclusão de todos os produtos de origem animal, focando em alimentos de origem vegetal.',
    benefits: ['Ambientalmente sustentável', 'Redução de colesterol', 'Anti-inflamatório', 'Ética animal'],
    disadvantages: ['Risco de deficiências', 'Planejamento complexo', 'Proteína incompleta', 'Custo elevado'],
    targetAudience: 'Vegetarianos estritos, preocupados com ambiente e animais',
    exampleMeals: ['Tofu + legumes', 'Lentilha + arroz', 'Feijão + quinoa', 'Proteína vegetal + vegetais'],
    macros: { protein: '1.5-2g/kg (vegetal)', carbs: '4-6g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Sustentabilidade, saúde, ética animal'
  },
  {
    id: 7, name: 'Vegetariana', category: 'Ovo-Lacto', image: '🥚',
    description: 'Exclusão de carne mas允许 ovos e laticínios, focando em alimentos de origem vegetal.',
    benefits: ['Mais sustentável', 'Redução de colesterol', 'Variada', 'Proteína completa'],
    disadvantages: ['Planejamento necessário', 'Risco de deficiências', 'Social restrito', 'Custo moderado'],
    targetAudience: 'Quem quer reduzir carne sem ser vegano',
    exampleMeals: ['Ovos + vegetais', 'Queijo + grãos', 'Lentilha + arroz', 'Iogurte + frutas'],
    macros: { protein: '1.5-2g/kg', carbs: '4-5g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Sustentabilidade, saúde, redução de carne'
  },
  {
    id: 8, name: 'Flexível (IIFYM)', category: 'Balanceada', image: '⚖️',
    description: 'Foco em atingir macros diárias sem restrições de alimentos, permitindo flexibilidade.',
    benefits: ['Flexibilidade social', 'Sustentável', 'Psicologicamente fácil', 'Variada'],
    disadvantages: ['Pode favorecer junk food', 'Requer contagem', 'Qualidade nutricional variável', 'Disciplina necessária'],
    targetAudience: 'Quem quer flexibilidade, atletas, pessoas com vida social ativa',
    exampleMeals: ['Qualquer alimento que se encaixe nos macros', 'Pizza ajustada', 'Hambúrguer saudável', 'Refeições variadas'],
    macros: { protein: '1.8-2.2g/kg', carbs: '3-5g/kg', fat: '0.8-1g/kg' },
    objectives: 'Adesão, flexibilidade, atingimento de macros'
  },
  {
    id: 9, name: 'Atleta', category: 'Performance', image: '🏆',
    description: 'Nutrição otimizada para máxima performance atlética e recuperação rápida.',
    benefits: ['Performance máxima', 'Recuperação rápida', 'Energia explosiva', 'Ganho de força'],
    disadvantages: ['Complexa', 'Custo elevado', 'Requer profissional', 'Rigidez temporal'],
    targetAudience: 'Atletas profissionais, competidores, high-level athletes',
    exampleMeals: ['Carboidratos complexos pré-treino', 'Proteína rápida pós-treino', 'Refeições timing específicas', 'Suplementação estratégica'],
    macros: { protein: '2-2.5g/kg', carbs: '6-10g/kg (varia)', fat: '0.8-1.2g/kg' },
    objectives: 'Performance atlética, recuperação, competição'
  },
  {
    id: 10, name: 'Crossfit', category: 'Alta Intensidade', image: '🔥',
    description: 'Dieta balanceada para suportar treinos de alta intensidade e variados.',
    benefits: ['Energia para WODs', 'Recuperação completa', 'Versatilidade', 'Ganho de força'],
    disadvantages: ['Alto volume alimentar', 'Custo elevado', 'Complexa', 'Requer adaptação'],
    targetAudience: 'Praticantes de Crossfit, atletas funcionais',
    exampleMeals: ['Proteína + carb complexo', 'Vegetais + gorduras saudáveis', 'Timing pós-WOD', 'Refeições balanceadas'],
    macros: { protein: '1.8-2.2g/kg', carbs: '4-6g/kg', fat: '1-1.5g/kg' },
    objectives: 'Performance em WODs, recuperação, força e condicionamento'
  },
  {
    id: 11, name: 'Maromba', category: 'Estética', image: '💪',
    description: 'Foco em estética muscular com alta proteína e carboidratos controlados.',
    benefits: ['Estética muscular', 'Ganho de massa', 'Definição', 'Popular no Brasil'],
    disadvantages: ['Pode ser extremo', 'Foco apenas estética', 'Suplementação pesada', 'Social restrito'],
    targetAudience: 'Fisiculturistas, quem busca estética extrema',
    exampleMeals: ['6 refeições proteicas', 'Carboidratos timing', 'Suplementação intensa', 'Alimentos limpos'],
    macros: { protein: '2.5-3g/kg', carbs: '3-5g/kg', fat: '0.8-1g/kg' },
    objectives: 'Hipertrofia, estética, definição muscular'
  },
  {
    id: 12, name: 'Bulking', category: 'Ganho de Massa', image: '📈',
    description: 'Superávit calórico agressivo para ganho máximo de massa muscular.',
    benefits: ['Ganho rápido', 'Força máxima', 'Volume muscular', 'Performance'],
    disadvantages: ['Ganho de gordura', 'Desconforto digestivo', 'Custo elevado', 'Dificuldade cutting posterior'],
    targetAudience: 'Hardgainers, off-season bodybuilders',
    exampleMeals: ['Grandes refeições', 'Carboidratos abundantes', 'Proteína alta', 'Frequência elevada'],
    macros: { protein: '2-2.5g/kg', carbs: '6-8g/kg', fat: '1-1.5g/kg' },
    objectives: 'Ganho máximo de massa, força, volume'
  },
  {
    id: 13, name: 'Cutting', category: 'Definição', image: '🎯',
    description: 'Déficit calórico calculado para perda de gordura preservando massa muscular.',
    benefits: ['Definição máxima', 'Preservação muscular', 'Estética', 'Composição corporal'],
    disadvantages: ['Fome', 'Redução de força', 'Humor afetado', 'Social restrito'],
    targetAudience: 'Pre-contest, quem busca definição',
    exampleMeals: ['Proteína alta', 'Carboidratos timing', 'Vegetais abundantes', 'Fibras elevadas'],
    macros: { protein: '2.5-3g/kg', carbs: '1-3g/kg', fat: '0.5-0.8g/kg' },
    objectives: 'Definição muscular, perda de gordura, estética'
  },
  {
    id: 14, name: 'Reeducação Alimentar', category: 'Saúde', image: '🍎',
    description: 'Mudança gradual de hábitos alimentares para saúde sustentável.',
    benefits: ['Sustentável', 'Saúde a longo prazo', 'Relação saudável com comida', 'Sem restrições extremas'],
    disadvantages: ['Resultados lentos', 'Requer paciência', 'Mudança de comportamento', 'Não focado em performance'],
    targetAudience: 'Quem quer saúde sustentável, recuperação de distúrbios',
    exampleMeals: ['Refeições balanceadas', 'Porções controladas', 'Variety', 'Comida real'],
    macros: { protein: '1.2-1.6g/kg', carbs: '3-5g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Saúde sustentável, hábitos saudáveis, bem-estar'
  },
  {
    id: 15, name: 'Alimentação Esportiva', category: 'Performance', image: '⚽',
    description: 'Nutrição específica para diferentes modalidades esportivas.',
    benefits: ['Performance otimizada', 'Recuperação específica', 'Energia para modalidade', 'Prevenção de lesões'],
    disadvantages: ['Complexa', 'Varia por esporte', 'Requer profissional', 'Custo elevado'],
    targetAudience: 'Atletas de diversas modalidades',
    exampleMeals: ['Varia por esporte', 'Timing específico', 'Hidratação estratégica', 'Suplementação direcionada'],
    macros: { protein: '1.5-2.5g/kg (varia)', carbs: '4-8g/kg (varia)', fat: '0.8-1.5g/kg' },
    objectives: 'Performance esportiva, recuperação, especificidade'
  },
  {
    id: 16, name: 'Alimentação Funcional', category: 'Saúde', image: '🥗',
    description: 'Foco em alimentos com propriedades funcionais e terapêuticas.',
    benefits: ['Saúde celular', 'Anti-inflamatório', 'Prevenção de doenças', 'Vitalidade'],
    disadvantages: ['Custo elevado', 'Acesso a ingredientes', 'Complexa', 'Requer conhecimento'],
    targetAudience: 'Quem busca saúde preventiva, pessoas com condições específicas',
    exampleMeals: ['Superfoods', 'Alimentos anti-inflamatórios', 'Fermentados', 'Orgânicos'],
    macros: { protein: '1.2-1.8g/kg', carbs: '3-5g/kg', fat: '1-1.5g/kg' },
    objectives: 'Saúde preventiva, vitalidade, bem-estar celular'
  },
  {
    id: 17, name: 'Alimentação Natural', category: 'Whole Foods', image: '🌿',
    description: 'Foco exclusivo em alimentos não processados e integrais.',
    benefits: ['Sem aditivos', 'Nutrientes completos', 'Sustentável', 'Digestão saudável'],
    disadvantages: ['Preparo demorado', 'Custo elevado', 'Acesso limitado', 'Social restrito'],
    targetAudience: 'Quem quer evitar processados, busca saúde natural',
    exampleMeals: ['Comida real', 'Grãos integrais', 'Proteínas naturais', 'Vegetais frescos'],
    macros: { protein: '1.2-1.8g/kg', carbs: '3-5g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Saúde natural, evitar processados, alimentação limpa'
  },
  {
    id: 18, name: 'Paleo', category: 'Primitiva', image: '🦴',
    description: 'Baseada na dieta de nossos ancestrais paleolíticos, sem processados.',
    benefits: ['Anti-inflamatória', 'Proteína alta', 'Sem processados', 'Digestão saudável'],
    disadvantages: ['Restritiva', 'Sem grãos', 'Sem laticínios', 'Social difícil'],
    targetAudience: 'Quem quer dieta evolutiva, intolerantes a glúten/lactose',
    exampleMeals: ['Carne + vegetais', 'Frutas + nozes', 'Peixe + raízes', 'Ovos + legumes'],
    macros: { protein: '1.8-2.5g/kg', carbs: '1-3g/kg', fat: '1-1.5g/kg' },
    objectives: 'Alimentação evolutiva, anti-inflamatória, sem processados'
  },
  {
    id: 19, name: 'Intermitente (Jejum)', category: 'Timing', image: '⏰',
    description: 'Ciclos de alimentação e jejum para otimizar metabolismo e saúde.',
    benefits: ['Flexibilidade metabólica', 'Autofagia', 'Simplicidade', 'Controle calórico fácil'],
    disadvantages: ['Fome inicial', 'Social restrito', 'Energia variável', 'Não para todos'],
    targetAudience: 'Pessoas com estilo de vida compatível, quem busca autofagia',
    exampleMeals: ['Janela de alimentação 8h', 'Refeições normais', 'Jejum 16h', 'Hidratação'],
    macros: { protein: '1.8-2.2g/kg', carbs: '3-5g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Autofagia, flexibilidade metabólica, controle calórico'
  },
  {
    id: 20, name: 'DASH', category: 'Pressão Arterial', image: '❤️',
    description: 'Desenvolvida para combater hipertensão, rica em frutas, vegetais e baixa em sódio.',
    benefits: ['Controle da pressão', 'Saúde cardiovascular', 'Rica em nutrientes', 'Recomendada por médicos'],
    disadvantages: ['Baixa em sódio', 'Pode ser insípida', 'Requer planejamento', 'Alto volume de alimentos'],
    targetAudience: 'Hipertensos, quem busca saúde cardiovascular',
    exampleMeals: ['Frutas + vegetais', 'Grãos integrais', 'Proteínas magras', 'Baixo sódio'],
    macros: { protein: '1.2-1.6g/kg', carbs: '4-6g/kg', fat: '0.8-1g/kg' },
    objectives: 'Controle da pressão arterial, saúde cardiovascular'
  },
  {
    id: 21, name: 'MIND', category: 'Cerebral', image: '🧠',
    description: 'Combinação de Mediterranean e DASH, focada em saúde cerebral e prevenção de demência.',
    benefits: ['Saúde cerebral', 'Prevenção de Alzheimer', 'Anti-inflamatória', 'Cognição melhorada'],
    disadvantages: ['Complexa', 'Requer variedade', 'Custo moderado', 'Acesso a ingredientes'],
    targetAudience: 'Idosos, quem busca saúde cerebral, histórico familiar de demência',
    exampleMeals: ['Berries', 'Vegetais folhosos', 'Nozes', 'Peixe graxo'],
    macros: { protein: '1.2-1.6g/kg', carbs: '3-5g/kg', fat: '1-1.5g/kg' },
    objectives: 'Saúde cerebral, prevenção de demência, cognição'
  },
  {
    id: 22, name: 'FODMAP Baixo', category: 'Digestiva', image: '🥗',
    description: 'Redução de carboidratos fermentáveis para tratar distúrbios digestivos.',
    benefits: ['Redução de sintomas', 'Digestão saudável', 'Bem-estar intestinal', 'Ciência-backed'],
    disadvantages: ['Muito restritiva', 'Complexa', 'Fase curta', 'Requer reintrodução'],
    targetAudience: 'Pessoas com SII, distúrbios digestivos',
    exampleMeals: ['Alimentos low FODMAP', 'Sem glúten', 'Sem lactose', 'Sem certos vegetais'],
    macros: { protein: '1.2-1.8g/kg', carbs: '2-4g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Saúde digestiva, tratamento de SII, bem-estar intestinal'
  },
  {
    id: 23, name: 'Anti-Inflamatória', category: 'Saúde', image: '🌱',
    description: 'Foco em alimentos que reduzem inflamação crônica no corpo.',
    benefits: ['Redução de inflamação', 'Saúde geral', 'Prevenção de doenças', 'Recuperação melhorada'],
    disadvantages: ['Pode ser restritiva', 'Custo elevado', 'Requer conhecimento', 'Acesso a ingredientes'],
    targetAudience: 'Pessoas com inflamação crônica, artrite, condições autoimunes',
    exampleMeals: ['Ômega-3', 'Antioxidantes', 'Especiarias', 'Vegetais coloridos'],
    macros: { protein: '1.2-1.8g/kg', carbs: '3-5g/kg', fat: '1-1.5g/kg' },
    objectives: 'Redução de inflamação, prevenção de doenças, recuperação'
  },
  {
    id: 24, name: 'Alcalina', category: 'pH', image: '🥬',
    description: 'Foco em alimentos que alcalinizam o corpo para equilibrar pH.',
    benefits: ['Equilíbrio pH', 'Energia', 'Digestão', 'Saúde óssea'],
    disadvantages: ['Controvérsia científica', 'Restritiva', 'Complexa', 'Não para todos'],
    targetAudience: 'Quem busca equilíbrio ácido-base',
    exampleMeals: ['Vegetais', 'Frutas', 'Nozes', 'Legumes'],
    macros: { protein: '1.2-1.6g/kg', carbs: '4-6g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Equilíbrio pH, alcalinização, energia'
  },
  {
    id: 25, name: 'Zone', category: 'Balanceada', image: '📊',
    description: 'Proporção específica de macros: 40% carb, 30% proteína, 30% gordura.',
    benefits: ['Balanceada', 'Controlada', 'Anti-inflamatória', 'Estável'],
    disadvantages: ['Complexa', 'Requer medição', 'Rígida', 'Social restrita'],
    targetAudiente: 'Quem quer controle preciso de macros',
    exampleMeals: ['Blocos de proteína', 'Blocos de carb', 'Blocos de gordura', 'Refeições balanceadas'],
    macros: { protein: '30%', carbs: '40%', fat: '30%' },
    objectives: 'Controle de inflamação, balanço hormonal, estabilidade'
  },
  {
    id: 26, name: 'Volumétrica', category: 'Saciedade', image: '🥣',
    description: 'Foco em alimentos de baixa densidade calórica mas alto volume para saciedade.',
    benefits: ['Saciedade', 'Baixa caloria', 'Volume alto', 'Sustentável'],
    disadvantages: ['Volume alimentar alto', 'Digestão inicial', 'Social restrita', 'Fome entre refeições'],
    targetAudience: 'Quem come muito, busca saciedade com poucas calorias',
    exampleMeals: ['Vegetais volumosos', 'Sopas', 'Alimentos ricos em água', 'Fibras altas'],
    macros: { protein: '1.5-2g/kg', carbs: '3-5g/kg', fat: '0.5-0.8g/kg' },
    objectives: 'Saciedade, perda de peso, volume alimentar'
  },
  {
    id: 27, name: 'Ortomolecular', category: 'Suplementação', image: '💊',
    description: 'Foco em otimização nutricional através de suplementação e alimentos específicos.',
    benefits: ['Otimização', 'Prevenção', 'Performance', 'Personalizada'],
    disadvantages: ['Custo elevado', 'Requer profissional', 'Complexa', 'Risco de excesso'],
    targetAudience: 'Quem busca otimização extrema, atletas',
    exampleMeals: ['Alimentos funcionais', 'Suplementação direcionada', 'Nutrientes específicos', 'Testes laboratoriais'],
    macros: { protein: '1.5-2.5g/kg', carbs: '3-5g/kg', fat: '0.8-1.5g/kg' },
    objectives: 'Otimização nutricional, performance, prevenção'
  },
  {
    id: 28, name: 'Macrobiótica', category: 'Filosófica', image: '🍚',
    description: 'Dieta baseada em filosofia oriental, focada em equilíbrio yin-yang através dos alimentos.',
    benefits: ['Equilíbrio', 'Alimentos integrais', 'Filosofia de vida', 'Sustentável'],
    disadvantages: ['Muito restritiva', 'Complexa', 'Filosofia específica', 'Social difícil'],
    targetAudience: 'Seguidores de filosofia oriental, busca equilíbrio',
    exampleMeals: ['Grãos integrais', 'Vegetais', 'Algas', 'Fermentados'],
    macros: { protein: '0.8-1.2g/kg', carbs: '5-7g/kg', fat: '0.5-0.8g/kg' },
    objectives: 'Equilíbrio yin-yang, filosofia de vida, harmonia'
  },
  {
    id: 29, name: 'Raw Food (Crudivorismo)', category: 'Natural', image: '🥕',
    description: 'Dieta composta exclusivamente por alimentos crus e não processados.',
    benefits: ['Enzimas preservadas', 'Nutrientes máximos', 'Energia vital', 'Natural'],
    disadvantages: ['Muito restritiva', 'Risco de deficiências', 'Social difícil', 'Digestão desafiadora'],
    targetAudience: 'Puristas de alimentos naturais',
    exampleMeals: ['Vegetais crus', 'Frutas', 'Nozes', 'Sementes'],
    macros: { protein: '1-1.5g/kg', carbs: '4-6g/kg', fat: '1-1.5g/kg' },
    objectives: 'Alimentação natural máxima, enzimas, vitalidade'
  },
  {
    id: 30, name: 'Ayurveda', category: 'Tradicional', image: '🕉️',
    description: 'Sistema tradicional indiano baseado no dosha individual (tipo corporal).',
    benefits: ['Personalizada', 'Equilíbrio', 'Tradicional', 'Holística'],
    disadvantages: ['Complexa', 'Requer conhecimento', 'Filosofia específica', 'Difícil seguir'],
    targetAudience: 'Seguidores de medicina tradicional indiana',
    exampleMeals: ['Varia por dosha', 'Especiarias ayurvédicas', 'Alimentos sattvic', 'Equilíbrio dos elementos'],
    macros: { protein: '1-1.8g/kg', carbs: '3-5g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Equilíbrio dos doshas, harmonia, medicina tradicional'
  },
  {
    id: 31, name: 'Bodybuilding (Competição)', category: 'Competição', image: '🏆',
    description: 'Dieta extrema para competição de fisiculturismo com timing preciso.',
    benefits: ['Máxima definição', 'Competição ready', 'Estética extrema', 'Performance'],
    disadvantages: ['Extrema', 'Insustentável', 'Risco à saúde', 'Requer profissional'],
    targetAudience: 'Fisiculturistas competidores',
    exampleMeals: ['Timing extremo', 'Depleção', 'Carb load', 'Peak week'],
    macros: { protein: '2.5-3g/kg', carbs: 'variável', fat: '0.3-0.6g/kg' },
    objectives: 'Competição, estética extrema, peak condition'
  },
  {
    id: 32, name: 'Powerlifting', category: 'Força', image: '🏋️',
    description: 'Nutrição focada em força máxima e performance nos 3 lifts.',
    benefits: ['Força máxima', 'Performance', 'Recuperação', 'Peso de categoria'],
    disadvantages: ['Foco específico', 'Pode não ser estética', 'Complexa', 'Requer timing'],
    targetAudience: 'Powerlifters, atletas de força',
    exampleMeals: ['Carboidratos para treino', 'Proteína alta', 'Timing pós-treino', 'Manutenção de peso'],
    macros: { protein: '2-2.5g/kg', carbs: '4-6g/kg', fat: '1-1.5g/kg' },
    objectives: 'Força máxima, performance, competição'
  },
  {
    id: 33, name: 'Endurance', category: 'Resistência', image: '🏃',
    description: 'Alta ingestão de carboidratos para suportar treinos de longa duração.',
    benefits: ['Energia duradoura', 'Glicogênio cheio', 'Performance endurance', 'Recuperação'],
    disadvantages: ['Volume alimentar alto', 'Digestão pesada', 'Custo elevado', 'Foco específico'],
    targetAudience: 'Maratonistas, triatletas, ciclistas',
    exampleMeals: ['Carb loading', 'Carboidratos complexos', 'Timing pré-treino', 'Reposição durante treino'],
    macros: { protein: '1.5-2g/kg', carbs: '8-12g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Performance endurance, glicogênio, resistência'
  },
  {
    id: 34, name: 'Gestacional Saudável', category: 'Materna', image: '🤰',
    description: 'Nutrição otimizada para saúde da mãe e desenvolvimento fetal.',
    benefits: ['Desenvolvimento fetal', 'Saúde materna', 'Recuperação pós-parto', 'Leite materno'],
    disadvantages: ['Requer acompanhamento', 'Aversões', 'Náuseas', 'Complexa'],
    targetAudience: 'Gestantes',
    exampleMeals: ['Ácido fólico', 'Ferro', 'Cálcio', 'Ômega-3'],
    macros: { protein: '1.5-2g/kg', carbs: '3-5g/kg', fat: '1-1.5g/kg' },
    objectives: 'Saúde materno-fetal, desenvolvimento, recuperação'
  },
  {
    id: 35, name: 'Pós-Treino Anabólico', category: 'Timing', image: '⚡',
    description: 'Foco específico na janela anabólica pós-treino para máxima recuperação.',
    benefits: ['Recuperação máxima', 'Síntese proteica', 'Glicogênio', 'Performance'],
    disadvantages: ['Foco muito específico', 'Não é dieta completa', 'Requer timing', 'Suplementação'],
    targetAudience: 'Atletas, bodybuilders',
    exampleMeals: ['Whey pós-treino', 'Carboidratos rápidos', 'Creatina', 'BCAAs'],
    macros: { protein: 'alto pós-treino', carbs: 'alto pós-treino', fat: 'moderado' },
    objectives: 'Recuperação pós-treino, síntese proteica, janela anabólica'
  },
  {
    id: 36, name: 'Pré-Contest', category: 'Competição', image: '🎯',
    description: 'Protocolo extremo para competição com depleção e carb load.',
    benefits: ['Peak condition', 'Definição máxima', 'Vascularity', 'Competição ready'],
    disadvantages: ['Extremo', 'Risco à saúde', 'Insustentável', 'Requer profissional'],
    targetAudience: 'Competidores pré-contest',
    exampleMeals: ['Depleção', 'Carb load', 'Sódio manipulation', 'Peak week'],
    macros: { protein: 'alto', carbs: 'variável', fat: 'muito baixo' },
    objectives: 'Peak condition, competição, vascularity'
  },
  {
    id: 37, name: 'Off-Season', category: 'Ganho', image: '📈',
    description: 'Fase de ganho com superávit calórico para construção muscular.',
    benefits: ['Ganho de massa', 'Força', 'Recuperação', 'Metabolismo elevado'],
    disadvantages: ['Ganho de gordura', 'Desconforto', 'Custo elevado', 'Cutting posterior'],
    targetAudience: 'Bodybuilders off-season',
    exampleMeals: ['Superávit calórico', 'Proteína alta', 'Carboidratos abundantes', 'Treino pesado'],
    macros: { protein: '2-2.5g/kg', carbs: '5-7g/kg', fat: '1-1.5g/kg' },
    objectives: 'Ganho muscular, força, off-season'
  },
  {
    id: 38, name: 'Manutenção', category: 'Equilíbrio', image: '⚖️',
    description: 'Dieta equilibrada para manter peso atual e composição corporal.',
    benefits: ['Sustentável', 'Flexível', 'Saúde', 'Sem estresse'],
    disadvantages: ['Sem ganhos rápidos', 'Requer monitoramento', 'Pode ser monótona', 'Disciplina necessária'],
    targetAudience: 'Quem atingiu objetivos e quer manter',
    exampleMeals: ['Calorias de manutenção', 'Balanceada', 'Variada', 'Flexível'],
    macros: { protein: '1.5-2g/kg', carbs: '3-5g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Manutenção, equilíbrio, sustentabilidade'
  },
  {
    id: 39, name: 'Recuperação Lesão', category: 'Reabilitação', image: '🏥',
    description: 'Nutrição otimizada para acelerar recuperação de lesões.',
    benefits: ['Recuperação acelerada', 'Redução inflamação', 'Cicatrização', 'Força mantida'],
    disadvantages: ['Específica', 'Requer profissional', 'Pode ser restritiva', 'Tempo limitado'],
    targetAudience: 'Pessoas com lesões, em reabilitação',
    exampleMeals: ['Proteína alta', 'Anti-inflamatórios', 'Colágeno', 'Vitamina C'],
    macros: { protein: '2-2.5g/kg', carbs: '3-5g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Recuperação de lesão, redução inflamação, cicatrização'
  },
  {
    id: 40, name: 'Senior/Idoso', category: 'Longevidade', image: '👴',
    description: 'Nutrição adaptada para necessidades específicas da terceira idade.',
    benefits: ['Saúde óssea', 'Massa muscular', 'Cognição', 'Vitalidade'],
    disadvantages: ['Apetite reduzido', 'Digestão lenta', 'Absorção diminuída', 'Isolamento social'],
    targetAudience: 'Idosos, terceira idade',
    exampleMeals: ['Cálcio', 'Proteína fácil digestão', 'Vitamina D', 'Ômega-3'],
    macros: { protein: '1.2-1.6g/kg', carbs: '3-4g/kg', fat: '0.8-1g/kg' },
    objectives: 'Longevidade, saúde óssea, massa muscular, cognição'
  },
  {
    id: 41, name: 'Adolescente', category: 'Desenvolvimento', image: '🧑',
    description: 'Nutrição para suportar crescimento e desenvolvimento na adolescência.',
    benefits: ['Crescimento adequado', 'Desenvolvimento', 'Energia', 'Concentração'],
    disadvantages: ['Apetite variável', 'Influências sociais', 'Fast food', 'Requer orientação'],
    targetAudience: 'Adolescentes em crescimento',
    exampleMeals: ['Cálcio', 'Ferro', 'Proteína', 'Carboidratos complexos'],
    macros: { protein: '1.5-2g/kg', carbs: '4-6g/kg', fat: '0.8-1.2g/kg' },
    objectives: 'Crescimento, desenvolvimento, energia, concentração'
  },
  {
    id: 42, name: 'Low Fat', category: 'Baixa Gordura', image: '🥛',
    description: 'Redução significativa de gorduras na dieta.',
    benefits: ['Baixa caloria', 'Saúde cardiovascular', 'Digestão leve', 'Volume alto'],
    disadvantages: ['Sabor reduzido', 'Absorção de vitaminas', 'Saciedade menor', 'Hormônios afetados'],
    targetAudience: 'Quem precisa reduzir gorduras, condições específicas',
    exampleMeals: ['Proteínas magras', 'Vegetais', 'Grãos', 'Frutas'],
    macros: { protein: '1.5-2g/kg', carbs: '4-6g/kg', fat: '<30g/dia' },
    objectives: 'Redução de gordura, saúde cardiovascular, baixa caloria'
  },
  {
    id: 43, name: 'High Carb', category: 'Alto Carboidrato', image: '🍚',
    description: 'Alta ingestão de carboidratos para energia e performance.',
    benefits: ['Energia alta', 'Performance', 'Humor melhorado', 'Glicogênio'],
    disadvantages: ['Pode ganhar gordura', 'Glicemia variável', 'Não para diabéticos', 'Digestão pesada'],
    targetAudience: 'Atletas, endurance, quem precisa de energia',
    exampleMeals: ['Carboidratos complexos', 'Frutas', 'Grãos', 'Timing específico'],
    macros: { protein: '1.5-2g/kg', carbs: '6-10g/kg', fat: '0.5-0.8g/kg' },
    objectives: 'Energia, performance, glicogênio, humor'
  },
  {
    id: 44, name: 'Ciclo de Carboidratos', category: 'Timing', image: '🔄',
    description: 'Alternância entre dias alto e baixo carboidrato para otimizar metabolismo.',
    benefits: ['Flexibilidade metabólica', 'Perda de gordura', 'Performance em dias altos', 'Variety'],
    disadvantages: ['Complexa', 'Planejamento necessário', 'Energia variável', 'Difícil social'],
    targetAudience: 'Atletas, quem busca flexibilidade metabólica',
    exampleMeals: ['Dias altos: carb abundantes', 'Dias baixos: carb restritos', 'Proteína constante', 'Treino nos dias altos'],
    macros: { protein: '1.8-2.2g/kg', carbs: 'variável (2-8g/kg)', fat: '0.8-1.2g/kg' },
    objectives: 'Flexibilidade metabólica, perda de gordura, performance variada'
  },
  {
    id: 45, name: 'Pescatariana', category: 'Plant-Based + Peixe', image: '🐟',
    description: 'Vegetariana mas inclui peixes e frutos do mar.',
    benefits: ['Ômega-3', 'Proteína completa', 'Sustentável', 'Saúde cardiovascular'],
    disadvantages: ['Custo elevado', 'Acesso a peixe', 'Metais pesados', 'Social restrito'],
    targetAudience: 'Vegetarianos que comem peixe',
    exampleMeals: ['Peixe + vegetais', 'Frutos do mar', 'Grãos', 'Vegetais'],
    macros: { protein: '1.5-2g/kg', carbs: '3-5g/kg', fat: '1-1.5g/kg' },
    objectives: 'Ômega-3, proteína completa, sustentabilidade'
  }
];

// ============================================================
// METAS
// ============================================================
const GOALS = [
  { id: 1, emoji: '🔥', name: 'Perder Peso', description: 'Reduza o percentual de gordura corporal com treinos e alimentação adequada.', tips: ['Déficit calórico de 300-500 kcal/dia', 'Priorize proteínas (2g/kg)', 'Cardio 3-4x por semana', 'Treino de força preserva músculo'] },
  { id: 2, emoji: '💪', name: 'Ganhar Massa', description: 'Aumente a massa muscular com treinos progressivos e superávit calórico.', tips: ['Superávit calórico de 200-400 kcal/dia', 'Proteína: 2-2.5g/kg de peso', 'Treino de força 4-5x por semana', 'Sono de qualidade 7-9h'] },
  { id: 3, emoji: '🏃', name: 'Melhorar Condicionamento', description: 'Aumente sua resistência cardiovascular e capacidade aeróbica.', tips: ['Cardio progressivo 3-5x/semana', 'Varie intensidade (HIIT + steady state)', 'Hidratação adequada', 'Recuperação entre sessões'] },
  { id: 4, emoji: '🧘', name: 'Flexibilidade', description: 'Melhore a mobilidade articular e reduza tensões musculares.', tips: ['Alongamento diário 15-20 min', 'Yoga ou pilates 2-3x/semana', 'Aquecimento antes dos treinos', 'Massagem e foam roller'] },
  { id: 5, emoji: '🏆', name: 'Performance', description: 'Maximize sua performance atlética para competições ou desafios pessoais.', tips: ['Periodização do treino', 'Nutrição esportiva específica', 'Recuperação ativa', 'Monitoramento de métricas'] },
  { id: 6, emoji: '❤️', name: 'Saúde Geral', description: 'Mantenha-se saudável, ativo e com qualidade de vida elevada.', tips: ['Exercício regular 3-4x/semana', 'Alimentação equilibrada', 'Gestão do estresse', 'Check-ups médicos regulares'] },
];

// ============================================================
// DICAS EDUCACIONAIS EXPANDIDAS
// ============================================================
const EDUCATION_TIPS = [
  { 
    id: 1, 
    emoji: '⚠️', 
    title: 'Não Pule o Aquecimento', 
    description: 'O aquecimento prepara músculos, tendões e articulações para o esforço. Pular essa etapa aumenta drasticamente o risco de lesões e reduz a performance.', 
    tips: [
      '5-10 min de aquecimento geral (caminhada, bike, elíptico)',
      'Mobilidade articular específica para o treino do dia',
      'Séries de aquecimento com 40-60% do peso de trabalho',
      'Nunca vá direto para o peso máximo sem preparação',
      'Aumente gradualmente a intensidade'
    ],
    examples: [
      'Para agachamento: 5min bike + 2x15 agachamento sem peso + 2x10 com 50% carga',
      'Para supino: 5min esteira + rotação de ombros + 2x12 supino vazio + 2x8 com 40% carga'
    ]
  },
  { 
    id: 2, 
    emoji: '🏋️', 
    title: 'Técnica Antes do Peso', 
    description: 'Executar exercícios com técnica incorreta é a principal causa de lesões na academia. Aprenda o movimento correto antes de aumentar a carga.', 
    tips: [
      'Comece com peso leve para aprender o padrão motor',
      'Grave-se em vídeo para analisar a técnica',
      'Peça orientação a um profissional certificado',
      'Priorize amplitude completa de movimento',
      'Controle a fase excêntrica (descida) lentamente'
    ],
    examples: [
      'No agachamento: mantenha coluna neutra, joelhos alinhados com pés, desça até coxas paralelas',
      'No supino: escápulas retraídas, cotovelos a 45°, barra desce até tocar o peito'
    ]
  },
  { 
    id: 3, 
    emoji: '😴', 
    title: 'Respeite o Descanso', 
    description: 'O músculo cresce durante o descanso, não durante o treino. Treinar sem recuperação adequada leva ao overtraining e regressão nos resultados.', 
    tips: [
      '48-72h de descanso para cada grupo muscular',
      'Sono de 7-9 horas por noite é essencial',
      'Semana de deload (redução de volume) a cada 4-6 semanas',
      'Ouça os sinais do seu corpo (fadiga excessiva, irritabilidade)',
      'Incorpore dias de descanso ativo (caminhada leve, alongamento)'
    ],
    examples: [
      'Split ABC: Treino A (descanso), Treino B (descanso), Treino C (descanso), Repetir',
      'Full body: 1 dia treino, 1 dia descanso, mínimo 3x por semana'
    ]
  },
  { 
    id: 4, 
    emoji: '💧', 
    title: 'Hidratação é Fundamental', 
    description: 'Desidratação de apenas 2% já prejudica a performance. Beba água antes, durante e após o treino para manter o rendimento e a saúde.', 
    tips: [
      '2-3L de água por dia como baseline',
      'Beba 500ml 30 minutos antes do treino',
      'Reponha 150-250ml a cada 15-20min durante o exercício',
      'Use isotônicos em treinos acima de 60min',
      'Monitore cor da urina (amarelo claro = hidratado)'
    ],
    examples: [
      'Pré-treino: 500ml água 30min antes',
      'Durante treino 1h: 200ml a cada 20min',
      'Pós-treino: 500ml + eletrólitos se suou muito'
    ]
  },
  { 
    id: 5, 
    emoji: '🍎', 
    title: 'Nutrição Pós-Treino', 
    description: 'A janela anabólica pós-treino é real. Consuma proteínas e carboidratos em até 2 horas após o exercício para maximizar a recuperação muscular.', 
    tips: [
      'Proteína: 20-40g imediatamente pós-treino',
      'Carboidratos simples para repor glicogênio rapidamente',
      'Whey protein é ideal por absorção rápida',
      'Refeição completa com proteína + carb + gordura em até 2h',
      'Não espere mais de 3h para comer após treino'
    ],
    examples: [
      'Pós-treino imediato: 1 scoop whey (30g) + banana (30g carb)',
      '1h depois: 200g frango grelhado + 150g arroz + salada'
    ]
  },
  { 
    id: 6, 
    emoji: '📈', 
    title: 'Progressão de Carga', 
    description: 'Para continuar evoluindo, você precisa aumentar progressivamente o estímulo. Fazer sempre o mesmo treino com o mesmo peso leva à estagnação.', 
    tips: [
      'Aumente 2.5-5% de carga por semana quando possível',
      'Varie repetições e séries para novos estímulos',
      'Periodize o treino a cada 4-8 semanas',
      'Registre todos os treinos em diário ou app',
      'Use técnicas avançadas quando progressão linear estagnar'
    ],
    examples: [
      'Semana 1: 3x10 com 50kg | Semana 2: 3x10 com 52.5kg | Semana 3: 3x10 com 55kg',
      'Quando estagnar: reduza carga e aumente reps (3x12), depois retorne ao progresso linear'
    ]
  },
  { 
    id: 7, 
    emoji: '🎯', 
    title: 'Defina Metas SMART', 
    description: 'Metas vagas levam a resultados vagos. Use o framework SMART para definir objetivos claros e alcançáveis.', 
    tips: [
      'Específico: defina exatamente o que quer alcançar',
      'Mensurável: use números e métricas',
      'Atingível: seja realista com seu nível atual',
      'Relevante: alinhe com seus objetivos principais',
      'Temporal: defina prazo claro'
    ],
    examples: [
      'Vago: "Quero ficar forte" | SMART: "Aumentar supino de 60kg para 80kg em 12 semanas"',
      'Vago: "Perder peso" | SMART: "Perder 5kg de gordura em 8 semanas mantendo massa muscular"'
    ]
  },
  { 
    id: 8, 
    emoji: '🧠', 
    title: 'Mente Sobre Corpo', 
    description: 'A mentalidade é tão importante quanto o treino. Desenvolva disciplina, consistência e uma relação saudável com o processo.', 
    tips: [
      'Foque no processo, não apenas no resultado',
      'Celebre pequenas vitórias ao longo do caminho',
      'Não se compare com outros; compare com você mesmo',
      'Aprenda a lidar com dias ruins e recaídas',
      'Desenvova hábitos automáticos em vez de depender de motivação'
    ],
    examples: [
      'Em vez de "preciso treinar", pense "sou alguém que treina" (identidade)',
      'Prepare roupa e mochila na noite anterior para remover barreiras'
    ]
  },
  { 
    id: 9, 
    emoji: '🔄', 
    title: 'Variedade no Treino', 
    description: 'O corpo se adapta rapidamente. Varie estímulos para continuar progredindo e evitar platôs.', 
    tips: [
      'Mude exercícios a cada 4-6 semanas',
      'Varie rep ranges (6-8 para força, 12-15 para hipertrofia)',
      'Altere ângulos e pegadas quando possível',
      'Use diferentes métodos (dropsets, supersets, circuitos)',
      'Mude ordem dos exercícios periodicamente'
    ],
    examples: [
      'Semana 1-4: 3x10 supino reto | Semana 5-8: 3x12 supino inclinado',
      'Semana 1-4: 3x10 agachamento | Semana 5-8: 4x8 leg press + 3x12 agachamento sumô'
    ]
  },
  { 
    id: 10, 
    emoji: '🛌', 
    title: 'Sono e Recuperação', 
    description: 'O sono é quando a mágica acontece. Hormônios anabólicos são liberados durante o sono profundo.', 
    tips: [
      '7-9 horas de sono por noite é não-negociável',
      'Mantenha horário consistente de dormir/acordar',
      'Evite telas 1h antes de dormir',
      'Quarto escuro, fresco e silencioso',
      'Cafeína no máximo 6h antes de dormir'
    ],
    examples: [
      'Rotina ideal: dormir 22:30, acordar 6:30 (8h), mesma hora todos os dias inclusive fim de semana',
      'Se precisar compensar: cochilo 20min após almoço, mas não substitua sono noturno'
    ]
  },
  { 
    id: 11, 
    emoji: '🥗', 
    title: 'Planejamento Alimentar', 
    description: 'Você não pode superar uma má dieta. Planeje suas refeições para garantir nutrição adequada.', 
    tips: [
      'Prepare refeições com antecedência (meal prep)',
      'Tenha sempre snacks saudáveis disponíveis',
      'Calcule suas macros e acompanhe a ingestão',
      'Não pule refeições, especialmente pré/pós-treino',
      'Hidratação constante ao longo do dia'
    ],
    examples: [
      'Domingo: cozinhe proteínas da semana (frango, carne, ovos)',
      'Sempre tenha: whey, barras proteicas, frutas, nuts na mochila'
    ]
  },
  { 
    id: 12, 
    emoji: '⚡', 
    title: 'Suplementação Inteligente', 
    description: 'Suplementos complementam, não substituem. Use apenas o que é comprovadamente eficaz para seus objetivos.', 
    tips: [
      'Whey protein: conveniente pós-treino',
      'Creatina: 3-5g/dia para força e massa',
      'Multivitamínico: seguro para cobrir deficiências',
      'Cafeína: 200-400mg pré-treino para performance',
      'Evite suplementos não comprovados e caros'
    ],
    examples: [
      'Base: whey + creatina + multivitamínico',
      'Opcional: pré-treino com cafeína + beta-alanina, BCAAs em treinos longos'
    ]
  }
];

// ============================================================
// UTILITÁRIOS
// ============================================================
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getAuthErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'Senha incorreta. Tente novamente.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/invalid-credential': 'Senha incorreta. Tente novamente.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
    'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  };
  return messages[code] || 'Ocorreu um erro. Tente novamente.';
}

// ============================================================
// COMPONENTE TOAST
// ============================================================
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <span>{t.icon}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true; // Padrão: modo escuro (true)
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userPlan, setUserPlan] = useState('free');
  const [userGoal, setUserGoal] = useState('');
  const [completedWorkoutsCount, setCompletedWorkoutsCount] = useState(0);
  const [userProfile, setUserProfile] = useState({ name: '', photoURL: '' });
  const [weeklyGoals, setWeeklyGoals] = useState({});

  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedGymWorkout, setSelectedGymWorkout] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [homeWorkoutFilter, setHomeWorkoutFilter] = useState('Todos');
  const [gymWorkoutFilter, setGymWorkoutFilter] = useState('Todos');

  const [timerTime, setTimerTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState('ascending');
  const [timerSetMinutes, setTimerSetMinutes] = useState(10);
  const [timerSetSeconds, setTimerSetSeconds] = useState(0);
  const timerRef = useRef(null);

  const [storeProducts, setStoreProducts] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Suplementos', price: '', image: '💊', imageUrl: '', description: '', link: '' });
  const [editingProductId, setEditingProductId] = useState(null);

  const [expandedEducation, setExpandedEducation] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAdminPaymentPanel, setShowAdminPaymentPanel] = useState(false);
  const [showProMenu, setShowProMenu] = useState(false);
  const [paymentTab, setPaymentTab] = useState('pix');
  const [paymentMethodTab, setPaymentMethodTab] = useState('pix');
  const [isAdminMaster, setIsAdminMaster] = useState(false); // Controle de acesso master
  const [foodDiary, setFoodDiary] = useState([]); // Diário de alimentação
  const [showFoodDiary, setShowFoodDiary] = useState(false); // Modal do diário
  const [selectedFoodDate, setSelectedFoodDate] = useState(new Date().toISOString().split('T')[0]); // Data selecionada
  const ADMIN_MASTER_EMAIL = 'andreyribeiro392@gmail.com'; // E-mail do master

  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [pixConfirmCode, setPixConfirmCode] = useState('');
  const [pixPending, setPixPending] = useState(false);

  const [adminBankData, setAdminBankData] = useState({
    pixKeyType: 'random', pixKey: '',
    cardholderName: '', cardNumber: '', cardExpiry: '', cardCVC: '',
    bankName: '', agencyNumber: '', accountNumber: '',
  });

  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const [exerciseTimers, setExerciseTimers] = useState({});
  const exerciseTimerRefs = useRef({});
  const [userMeals, setUserMeals] = useState({});
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [mealInput, setMealInput] = useState('');
  const [showMobileMenuNav, setShowMobileMenuNav] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // AI Assistant State
  const [aiMessages, setAiMessages] = useState([
    { id: 1, role: 'assistant', content: 'Olá! Sou seu assistente de fitness IA. Posso ajudar com treinos personalizados, nutrição, metas e muito mais. Como posso ajudar você hoje?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const addToast = useCallback((message, type = 'info', icon = 'ℹ️') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Verifica se o usuário é o admin master
        setIsAdminMaster(u.email === ADMIN_MASTER_EMAIL);
        await loadUserData(u.uid);
      } else {
        setUser(null);
        setIsAdminMaster(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function checkPendingPayments(uid) {
    try {
      const paymentRef = doc(db, 'payments', uid);
      const paymentSnap = await getDoc(paymentRef);
      if (paymentSnap.exists()) {
        const payment = paymentSnap.data();
        console.log('[DEBUG] Pagamento encontrado:', payment);
        if (payment.status === 'approved' || payment.status === 'aproved') {
          console.log('[DEBUG] Pagamento aprovado! Atualizando plano para PRO...');
          await updateDoc(doc(db, 'users', uid), { plan: 'pro', upgradedAt: serverTimestamp() });
          setUserPlan('pro');
          addToast('Pagamento aprovado! Bem-vindo ao PRO! 🎉', 'success', '💎');
        }
      }
    } catch (e) {
      console.error('[DEBUG] Erro ao verificar pagamentos:', e);
    }
  }

  async function loadUserData(uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        // Auto-PRO apenas para e-mail mestre: andreybribeiro392@gmail.com
        const userEmail = data.email || '';
        const isPro = userEmail === 'andreybribeiro392@gmail.com' ? 'pro' : (data.plan || 'free');
        setUserPlan(isPro);
        console.log('[DEBUG] Email:', userEmail, '| Plan:', isPro);
        setUserGoal(data.goal || '');
        setCompletedWorkoutsCount(data.completedWorkouts || 0);
        setWeeklyGoals(data.weeklyGoals || {});
        setUserProfile({ name: data.name || '', photoURL: data.photoURL || '' });
        setProfileName(data.name || '');
        
        // Verificar pagamentos pendentes
        console.log('[DEBUG] Verificando pagamentos pendentes para:', uid);
        await checkPendingPayments(uid);
      }
    } catch (e) { console.error('Erro ao carregar dados:', e); }
  }

  useEffect(() => {
    if (!user) return;
    const loadProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setStoreProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error('Erro ao carregar produtos:', e); }
    };
    loadProducts();
  }, [user]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerTime((prev) => {
          if (timerMode === 'ascending') return prev + 1;
          if (prev <= 0) { setTimerActive(false); addToast('Tempo esgotado!', 'warning', '⏰'); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timerMode, addToast]);

  function startDescendingTimer() {
    const totalSeconds = timerSetMinutes * 60 + timerSetSeconds;
    if (totalSeconds <= 0) { addToast('Configure um tempo válido', 'error', '❌'); return; }
    setTimerTime(totalSeconds);
    setTimerMode('descending');
    setTimerActive(true);
  }

  function getTimerClass() {
    if (timerMode === 'descending') {
      if (timerTime <= 10 && timerTime > 0) return 'timer-display danger';
      if (timerTime <= 30) return 'timer-display warning';
    }
    return 'timer-display';
  }

  function startExerciseTimer(exerciseId, minutes = 1) {
    const totalSeconds = minutes * 60;
    setExerciseTimers((prev) => ({
      ...prev,
      [exerciseId]: { time: totalSeconds, active: true, mode: 'descending' },
    }));
  }

  function toggleExerciseTimer(exerciseId) {
    setExerciseTimers((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], active: !prev[exerciseId]?.active },
    }));
  }

  function resetExerciseTimer(exerciseId) {
    setExerciseTimers((prev) => {
      const newTimers = { ...prev };
      delete newTimers[exerciseId];
      return newTimers;
    });
  }

  function addMeal(nutritionId, meal) {
    if (!meal.trim()) return;
    setUserMeals((prev) => ({
      ...prev,
      [nutritionId]: [...(prev[nutritionId] || []), meal],
    }));
    setMealInput('');
    addToast('Refeição adicionada!', 'success', '✅');
  }

  function removeMeal(nutritionId, index) {
    setUserMeals((prev) => ({
      ...prev,
      [nutritionId]: prev[nutritionId].filter((_, i) => i !== index),
    }));
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Auto-PRO apenas para e-mail mestre: andreybribeiro392@gmail.com
        const userPlan = cred.user.email === 'andreybribeiro392@gmail.com' ? 'pro' : 'free';
        console.log('[DEBUG] Novo usuário criado:', cred.user.email, '| Plan:', userPlan);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: cred.user.email, plan: userPlan, completedWorkouts: 0,
          goal: '', name: '', createdAt: serverTimestamp(),
        });
        setAuthSuccess('Conta criada! Bem-vindo ao AuraFit!');
      }
    } catch (err) {
      setAuthError(getAuthErrorMessage(err.code));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setCurrentPage('dashboard');
  }

  function canStartWorkout() {
    if (userPlan === 'pro') return true;
    if (completedWorkoutsCount >= 2) { setShowUpgradeModal(true); return false; }
    return true;
  }

  async function finishWorkout() {
    try {
      const newCount = completedWorkoutsCount + 1;
      await updateDoc(doc(db, 'users', user.uid), { completedWorkouts: newCount, lastWorkoutDate: serverTimestamp() });
      setCompletedWorkoutsCount(newCount);
      addToast('Parabéns! Treino finalizado!', 'success', '🏆');
      setSelectedWorkout(null);
      setSelectedGymWorkout(null);
      setCompletedExercises([]);
      setTimerActive(false);
      setTimerTime(0);
    } catch (e) { addToast('Erro ao salvar treino', 'error', '❌'); }
  }

  async function handleSaveProduct() {
    if (!newProduct.name || !newProduct.price) { addToast('Preencha nome e preço', 'error', '❌'); return; }
    try {
      if (editingProductId) {
        await updateDoc(doc(db, 'products', editingProductId), newProduct);
        setStoreProducts((prev) => prev.map((p) => p.id === editingProductId ? { ...p, ...newProduct } : p));
        addToast('Produto atualizado!', 'success', '✅');
      } else {
        const ref = await addDoc(collection(db, 'products'), { ...newProduct, createdAt: serverTimestamp() });
        setStoreProducts((prev) => [...prev, { id: ref.id, ...newProduct }]);
        addToast('Produto adicionado!', 'success', '✅');
      }
      setNewProduct({ name: '', category: 'Suplementos', price: '', image: '💊', imageUrl: '', description: '', link: '' });
      setEditingProductId(null);
    } catch (e) { addToast('Erro ao salvar produto', 'error', '❌'); }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Deletar este produto?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setStoreProducts((prev) => prev.filter((p) => p.id !== id));
      addToast('Produto deletado', 'info', '🗑️');
    } catch (e) { addToast('Erro ao deletar', 'error', '❌'); }
  }

  async function handlePixConfirm() {
    if (!pixConfirmCode.trim()) { addToast('Informe o código de confirmação', 'error', '❌'); return; }
    setProcessingPayment(true);
    try {
      const paymentRef = doc(db, 'payments', user.uid);
      const paymentSnap = await getDoc(paymentRef);
      if (paymentSnap.exists() && paymentSnap.data().status === 'approved') {
        await updateDoc(doc(db, 'users', user.uid), { plan: 'pro', upgradedAt: serverTimestamp() });
        setUserPlan('pro');
        setShowUpgradeModal(false);
        addToast('Bem-vindo ao PRO! 🎉', 'success', '💎');
      } else {
        await setDoc(paymentRef, {
          userId: user.uid, email: user.email, amount: 9.99, method: 'pix',
          confirmCode: pixConfirmCode.trim(), status: 'pending', requestedAt: serverTimestamp(),
        });
        setPixPending(true);
        addToast('Pagamento em análise. Aguarde a confirmação.', 'warning', '⏳');
      }
    } catch (e) { addToast('Erro ao verificar pagamento', 'error', '❌'); }
    finally { setProcessingPayment(false); }
  }

  async function handleCardPayment() {
    if (!cardName || !cardNumber || !cardExpiry || !cardCVC) { addToast('Preencha todos os dados do cartão', 'error', '❌'); return; }
    if (cardNumber.replace(/\s/g, '').length < 16) { addToast('Número do cartão inválido', 'error', '❌'); return; }
    setProcessingPayment(true);
    try {
      const paymentRef = doc(db, 'payments', user.uid);
      const paymentSnap = await getDoc(paymentRef);
      if (paymentSnap.exists() && paymentSnap.data().status === 'approved') {
        await updateDoc(doc(db, 'users', user.uid), { plan: 'pro', upgradedAt: serverTimestamp() });
        setUserPlan('pro');
        setShowUpgradeModal(false);
        addToast('Bem-vindo ao PRO! 🎉', 'success', '💎');
      } else {
        await setDoc(paymentRef, {
          userId: user.uid, email: user.email, amount: 9.99, method: 'card',
          cardLast4: cardNumber.replace(/\s/g, '').slice(-4), status: 'pending', requestedAt: serverTimestamp(),
        });
        addToast('Pagamento em análise. Aguarde a confirmação.', 'warning', '⏳');
        setShowUpgradeModal(false);
      }
    } catch (e) { addToast('Erro ao processar pagamento', 'error', '❌'); }
    finally { setProcessingPayment(false); }
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: profileName });
      setUserProfile((prev) => ({ ...prev, name: profileName }));
      addToast('Perfil atualizado!', 'success', '✅');
    } catch (e) { addToast('Erro ao salvar perfil', 'error', '❌'); }
    finally { setSavingProfile(false); }
  }

  async function saveWeeklyGoal(goalName, day, value) {
    const key = `${goalName}-${day}`;
    const newGoals = { ...weeklyGoals, [key]: value };
    setWeeklyGoals(newGoals);
    try { await updateDoc(doc(db, 'users', user.uid), { weeklyGoals: newGoals }); }
    catch (e) { console.error('Erro ao salvar meta:', e); }
  }

  // AI Assistant Functions
  async function handleAiMessage() {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);
    setAiInput('');
    setAiLoading(true);
    
    // Simulate AI response (in production, integrate with real AI service)
    setTimeout(() => {
      const responses = [
        `Baseado no seu objetivo de "${userGoal || 'fitness'}", recomendo: 3-4x por semana de treino de força + 2x cardio moderado.`,
        `Para ${userGoal === 'Perder Peso' ? 'perda de peso' : userGoal === 'Ganhar Massa' ? 'ganho de massa' : 'melhorar condicionamento'}, foque em: proteína adequada (2g/kg), sono 7-9h, e hidratação constante.`,
        `Treino sugerido para hoje: 5min aquecimento + 20min treino principal + 5min alongamento. Quer que eu detalhe?`,
        `Dica nutricional: ${userGoal === 'Perder Peso' ? 'Déficit calórico de 300-500kcal' : 'Superávit de 200-400kcal'} com alimentos integrais.`,
        `Lembre-se: consistência é mais importante que intensidade. Comece devagar e aumente gradualmente!`
      ];
      
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: aiResponse }]);
      setAiLoading(false);
    }, 1500);
  }

  const filteredHomeWorkouts = homeWorkoutFilter === 'Todos' ? HOME_WORKOUTS : HOME_WORKOUTS.filter((w) => w.level === homeWorkoutFilter);
  const filteredGymWorkouts = gymWorkoutFilter === 'Todos' ? GYM_WORKOUTS : GYM_WORKOUTS.filter((w) => w.category === gymWorkoutFilter);
  const gymCategories = ['Todos', ...new Set(GYM_WORKOUTS.map((w) => w.category))];

  if (loading) return <div className="loading">⚡ AuraFit Carregando...</div>;

  // ============================================================
  // TELA DE LOGIN
  // ============================================================
  if (!user) {
    return (
      <div className={`auth-container ${darkMode ? 'dark' : ''}`}>
        <VideoBackground />
        <AudioPlayer />
        <div className="auth-box">
          <div className="auth-logo">
            <img src="/favicon_weight.png" alt="AuraFit Logo" />
          </div>
          <h1>AuraFit</h1>
          <p>Seu app de treinos premium</p>
          <div className="auth-tabs">
            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setAuthError(''); setAuthSuccess(''); }}>Entrar</button>
            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setAuthError(''); setAuthSuccess(''); }}>Criar Conta</button>
          </div>
          {authError && <div className="auth-error">⚠️ {authError}</div>}
          {authSuccess && <div className="auth-success">✅ {authSuccess}</div>}
          <form className="auth-form" onSubmit={handleAuth}>
            <div className="auth-input-group">
              <label>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="auth-input-group">
              <label>Senha</label>
              <input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={authLoading}>
              {authLoading ? '⏳ Aguarde...' : isLogin ? '🚀 Entrar' : '✨ Criar Conta'}
            </button>
          </form>
          <div className="auth-toggle">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button onClick={() => { setIsLogin(!isLogin); setAuthError(''); setAuthSuccess(''); }}>
              {isLogin ? 'Registre-se grátis' : 'Faça login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // APP PRINCIPAL
  // ============================================================
  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <VideoBackground />
      <AudioPlayer />

      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <button className="mobile-back-btn" onClick={() => setCurrentPage('dashboard')} title="Voltar">
              ← 
            </button>
            <img src="/favicon_weight.png" alt="AuraFit" />
            <h1>Aura<span>Fit</span></h1>
          </div>
          <div className="user-info">
            <button onClick={() => setShowMobileMenuNav(!showMobileMenuNav)} className="mobile-menu-btn" title="Menu">
              ≡
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle" title="Alternar tema">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="pro-menu-container">
              <button onClick={() => setShowProMenu(!showProMenu)} className={`plan-badge ${userPlan}`}>
                {userPlan === 'pro' ? '💎 PRO' : '🆓 FREE'}
              </button>
              {showProMenu && (
                <div className="pro-menu-dropdown">
                  {userPlan === 'pro' ? (
                    <>
                      <div className="pro-menu-item pro-status">✅ Você é PRO!</div>
                      <button className="pro-menu-item" onClick={() => { setShowAdminPaymentPanel(true); setShowProMenu(false); }}>💳 Dados de Pagamento</button>
                    </>
                  ) : (
                    <button className="pro-menu-item" onClick={() => { setShowUpgradeModal(true); setShowProMenu(false); }}>💎 Fazer Upgrade para PRO</button>
                  )}
                </div>
              )}
            </div>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <nav className="sidebar-nav">
        {[
          { id: 'dashboard', icon: '📊', label: 'Dashboard' },
          { id: 'home-workouts', icon: '🏠', label: 'Treinos em Casa' },
          { id: 'gym-workouts', icon: '🏋️', label: 'Academia' },
          { id: 'nutrition', icon: '🍎', label: 'Nutrição' },
          { id: 'goals', icon: '🎯', label: 'Metas' },
          { id: 'ai-assistant', icon: '🤖', label: 'IA Fitness' },
          { id: 'store', icon: '🛒', label: 'Loja' },
          { id: 'education', icon: '📚', label: 'Educação' },
          { id: 'profile', icon: '👤', label: 'Perfil' },
        ].map((item) => (
          <button key={item.id} className={`nav-btn ${currentPage === item.id ? 'active' : ''}`} onClick={() => setCurrentPage(item.id)}>
            {item.icon} {item.label}
          </button>
        ))}
        <button onClick={handleLogout} className="logout-btn">🚪 Sair</button>
      </nav>

      {/* MENU MOBILE */}
      {showMobileMenuNav && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenuNav(false)}>
          <nav className="mobile-menu-nav" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-menu-close" onClick={() => setShowMobileMenuNav(false)}>✕</button>
            {[
              { id: 'dashboard', icon: '📊', label: 'Dashboard' },
              { id: 'home-workouts', icon: '🏠', label: 'Treinos em Casa' },
              { id: 'gym-workouts', icon: '🏋️', label: 'Academia' },
              { id: 'nutrition', icon: '🍎', label: 'Nutrição' },
              { id: 'goals', icon: '🎯', label: 'Metas' },
              { id: 'ai-assistant', icon: '🤖', label: 'IA Fitness' },
              { id: 'store', icon: '🛒', label: 'Loja' },
              { id: 'education', icon: '📚', label: 'Educação' },
              { id: 'profile', icon: '👤', label: 'Perfil' },
            ].map((item) => (
              <button 
                key={item.id} 
                className={`mobile-menu-item ${currentPage === item.id ? 'active' : ''}`} 
                onClick={() => { setCurrentPage(item.id); setShowMobileMenuNav(false); }}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </button>
            ))}
            <button className="mobile-menu-logout" onClick={() => { handleLogout(); setShowMobileMenuNav(false); }}>
              🚪 Sair
            </button>
          </nav>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* DASHBOARD - REDESIGNADO */}
        {currentPage === 'dashboard' && (
          <div className="dashboard-page">

            {/* HERO SECTION PREMIUM COM VÍDEO 4K */}
            <div className="hero-section-premium">
              <div className="hero-video-background">
                <video autoPlay loop muted playsInline className="hero-video">
                  <source src="https://videos.pexels.com/video-files/5329767/5329767-uhd_2160_3840_25fps.mp4" type="video/mp4" />
                </video>
                <div className="hero-overlay-gradient"></div>
                <div className="hero-lighting-effect"></div>
              </div>
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-pulse">⚡</span>
                  <span>Transforme Seu Corpo</span>
                </div>
                <h1 className="hero-title">
                  <span className="title-gradient">AuraFit</span>
                  <span className="title-accent">Pro</span>
                </h1>
                <p className="hero-subtitle">Sua jornada fitness começa aqui. Treinos personalizados, nutrição inteligente e IA avançada.</p>
                <div className="hero-stats">
                  <div className="hero-stat-item">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{completedWorkoutsCount}</div>
                    <div className="stat-label">Treinos</div>
                  </div>
                  <div className="hero-stat-item">
                    <div className="stat-icon">💎</div>
                    <div className="stat-value">{userPlan === 'pro' ? 'PRO' : 'FREE'}</div>
                    <div className="stat-label">Plano</div>
                  </div>
                  <div className="hero-stat-item">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{userGoal ? userGoal.split(' ')[0] : '---'}</div>
                    <div className="stat-label">Meta</div>
                  </div>
                </div>
                <div className="hero-cta">
                  <button onClick={() => setCurrentPage('home-workouts')} className="hero-btn primary">
                    <span>▶️</span> Começar Agora
                  </button>
                  <button onClick={() => setShowUpgradeModal(true)} className="hero-btn secondary">
                    <span>💎</span> Upgrade PRO
                  </button>
                </div>
              </div>
            </div>

            {/* TIME DISPLAY */}
            <div className="time-display-premium">
              <div className="time-section">
                <div className="time-value">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div className="date-value">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              </div>
            </div>

            {/* BENEFÍCIOS SECTION */}
            <div className="benefits-section">
              <h2 className="section-title">✨ Por que escolher AuraFit?</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">🎯</div>
                  <h3>Treinos Personalizados</h3>
                  <p>Planos adaptados ao seu nível e objetivos específicos</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🍎</div>
                  <h3>45 Estilos Alimentares</h3>
                  <p>Dieta completa com informações detalhadas de cada abordagem</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🤖</div>
                  <h3>IA Fitness Avançada</h3>
                  <p>Assistente inteligente para treinos e dietas personalizadas</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">📊</div>
                  <h3>Acompanhamento Completo</h3>
                  <p>Metas, progresso e estatísticas detalhadas</p>
                </div>
              </div>
            </div>

            {/* RESULTADOS SECTION */}
            <div className="results-section">
              <h2 className="section-title">🏆 Resultados Reais</h2>
              <div className="results-grid">
                <div className="result-card">
                  <div className="result-number">10K+</div>
                  <div className="result-label">Usuários Ativos</div>
                </div>
                <div className="result-card">
                  <div className="result-number">50K+</div>
                  <div className="result-label">Treinos Completados</div>
                </div>
                <div className="result-card">
                  <div className="result-number">4.9⭐</div>
                  <div className="result-label">Avaliação Média</div>
                </div>
                <div className="result-card">
                  <div className="result-number">98%</div>
                  <div className="result-label">Satisfação</div>
                </div>
              </div>
            </div>

            {/* QUICK ACCESS CARDS */}
            <div className="quick-access-section">
              <h2 className="section-title">⚡ Acesso Rápido</h2>
              <div className="quick-access-grid">
                <div className="quick-card" onClick={() => setCurrentPage('home-workouts')}>
                  <div className="quick-card-icon">🏠</div>
                  <h3>Treino em Casa</h3>
                  <p>Exercícios sem equipamento</p>
                  <div className="quick-card-arrow">→</div>
                </div>
                <div className="quick-card" onClick={() => setCurrentPage('gym-workouts')}>
                  <div className="quick-card-icon">🏋️</div>
                  <h3>Academia</h3>
                  <p>Treinos com equipamentos</p>
                  <div className="quick-card-arrow">→</div>
                </div>
                <div className="quick-card" onClick={() => setCurrentPage('nutrition')}>
                  <div className="quick-card-icon">🍎</div>
                  <h3>Nutrição</h3>
                  <p>45 estilos alimentares</p>
                  <div className="quick-card-arrow">→</div>
                </div>
                <div className="quick-card" onClick={() => setCurrentPage('goals')}>
                  <div className="quick-card-icon">🎯</div>
                  <h3>Metas</h3>
                  <p>Defina seus objetivos</p>
                  <div className="quick-card-arrow">→</div>
                </div>
                <div className="quick-card" onClick={() => setCurrentPage('education')}>
                  <div className="quick-card-icon">📚</div>
                  <h3>Educação</h3>
                  <p>Dicas e orientações</p>
                  <div className="quick-card-arrow">→</div>
                </div>
                <div className="quick-card" onClick={() => setCurrentPage('store')}>
                  <div className="quick-card-icon">🛒</div>
                  <h3>Loja</h3>
                  <p>Produtos fitness</p>
                  <div className="quick-card-arrow">→</div>
                </div>
              </div>
            </div>

            {/* UPGRADE BANNER */}
            {userPlan === 'free' && (
              <div className="upgrade-banner-premium">
                <div className="upgrade-content">
                  <div className="upgrade-icon">💎</div>
                  <div className="upgrade-text">
                    <h3>Desbloqueie Todo o Potencial</h3>
                    <p>Treinos ilimitados, IA avançada e recursos exclusivos por apenas R$ 9,99/mês</p>
                  </div>
                  <button onClick={() => setShowUpgradeModal(true)} className="upgrade-btn-premium">
                    Fazer Upgrade PRO
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TREINOS EM CASA - LISTA */}
        {currentPage === 'home-workouts' && !selectedWorkout && (
          <div className="workouts-page">
            <div className="page-header">
              <h2>🏠 Treinos em Casa</h2>
              <p>Exercícios completos sem precisar de academia ou equipamentos</p>
            </div>
            <div className="filter-buttons">
              {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map((f) => (
                <button key={f} className={`filter-btn ${homeWorkoutFilter === f ? 'active' : ''}`} onClick={() => setHomeWorkoutFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="workouts-grid">
              {filteredHomeWorkouts.map((workout) => (
                <div key={workout.id} className="workout-card">
                  <div className="workout-card-header">
                    <div className="workout-emoji-container">{workout.image}</div>
                    <div className="workout-card-info">
                      <h3>{workout.name}</h3>
                      <div className="workout-badges">
                        <span className="badge badge-muscle">{workout.level}</span>
                        <span className="badge badge-muscle">{workout.muscleGroup}</span>
                      </div>
                      <div className="workout-meta">
                        <span>⏱️ {workout.duration}</span>
                        <span className="difficulty-stars">{'⭐'.repeat(workout.difficulty)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="workout-description">{workout.description}</p>
                  {workout.benefits && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {workout.benefits.map((b, i) => (
                        <span key={i} style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px' }}>✓ {b}</span>
                      ))}
                    </div>
                  )}
                  <div className="workout-exercises-preview">
                    {workout.exercises.slice(0, 3).map((ex, i) => (
                      <div key={i} className="exercise-preview-item"><strong>{ex.name}</strong> — {ex.reps}</div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="exercise-preview-item" style={{ color: 'var(--primary)', fontWeight: 600 }}>+{workout.exercises.length - 3} exercícios</div>
                    )}
                  </div>
                  <button
                    className="select-btn"
                    disabled={userPlan === 'free' && completedWorkoutsCount >= 2}
                    onClick={() => { if (canStartWorkout()) { setSelectedWorkout(workout); setCompletedExercises([]); setTimerTime(0); setTimerActive(false); } }}
                  >
                    {userPlan === 'free' && completedWorkoutsCount >= 2 ? '🔒 Upgrade para PRO' : '▶️ Começar Treino'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TREINO EM CASA - DETALHE */}
        {currentPage === 'home-workouts' && selectedWorkout && (
          <div className="workout-details">
            <button className="back-btn" onClick={() => { setSelectedWorkout(null); setTimerActive(false); setTimerTime(0); }}>← Voltar</button>
            <div className="workout-details-header">
              <div className="workout-details-emoji">{selectedWorkout.image}</div>
              <div className="workout-details-info">
                <h2>{selectedWorkout.name}</h2>
                <div className="workout-badges" style={{ marginBottom: 8 }}>
                  <span className="badge badge-muscle">{selectedWorkout.level}</span>
                  <span className="badge badge-muscle">{selectedWorkout.muscleGroup}</span>
                  <span className="badge badge-muscle">⏱️ {selectedWorkout.duration}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedWorkout.description}</p>
                {selectedWorkout.benefits && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {selectedWorkout.benefits.map((b, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px' }}>✓ {b}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="exercises-list">
              <h3>📋 Exercícios ({completedExercises.length}/{selectedWorkout.exercises.length} concluídos)</h3>
              {selectedWorkout.exercises.map((exercise, idx) => (
                <div key={idx} className={`exercise-item ${completedExercises.includes(idx) ? 'completed' : ''}`}>
                  <input type="checkbox" checked={completedExercises.includes(idx)} onChange={() => setCompletedExercises((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx])} id={`ex-${idx}`} />
                  <label htmlFor={`ex-${idx}`}>
                    <span className="exercise-name">{exercise.name}</span>
                    <div className="exercise-details">
                      <span className="exercise-detail-tag">🔁 {exercise.reps}</span>
                      <span className="exercise-detail-tag">⏸️ Descanso: {exercise.rest}</span>
                    </div>
                    {exercise.tip && <span className="exercise-tip">💡 {exercise.tip}</span>}
                  </label>
                </div>
              ))}
            </div>
            {/* CRONÔMETRO */}
            <div className="timer-section">
              <h3>⏱️ Cronômetro</h3>
              <div className={getTimerClass()}>{formatTime(timerTime)}</div>
              <div className="timer-mode-selector">
                <button className={`timer-mode-btn ${timerMode === 'ascending' ? 'active' : ''}`} onClick={() => { setTimerMode('ascending'); setTimerTime(0); setTimerActive(false); }}>⬆️ Crescente</button>
                <button className={`timer-mode-btn ${timerMode === 'descending' ? 'active' : ''}`} onClick={() => { setTimerMode('descending'); setTimerActive(false); }}>⬇️ Regressivo</button>
              </div>
              {timerMode === 'descending' && (
                <div className="timer-set-time">
                  <label>Minutos:</label>
                  <input type="number" min="0" max="99" className="timer-time-input" value={timerSetMinutes} onChange={(e) => setTimerSetMinutes(Math.max(0, parseInt(e.target.value) || 0))} />
                  <label>Segundos:</label>
                  <input type="number" min="0" max="59" className="timer-time-input" value={timerSetSeconds} onChange={(e) => setTimerSetSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} />
                </div>
              )}
              <div className="timer-buttons">
                {timerMode === 'descending' && !timerActive && timerTime === 0 ? (
                  <button className="timer-btn start" onClick={startDescendingTimer}>▶️ Iniciar</button>
                ) : (
                  <button className={`timer-btn ${timerActive ? '' : 'start'}`} onClick={() => setTimerActive(!timerActive)}>
                    {timerActive ? '⏸️ Pausar' : '▶️ Continuar'}
                  </button>
                )}
                <button className="timer-btn" onClick={() => { setTimerTime(0); setTimerActive(false); }}>🔄 Reiniciar</button>
              </div>
            </div>
            <button className="finish-btn" disabled={completedExercises.length !== selectedWorkout.exercises.length} onClick={finishWorkout}>
              ✅ Finalizar Treino ({completedExercises.length}/{selectedWorkout.exercises.length})
            </button>
          </div>
        )}

        {/* ACADEMIA - LISTA */}
        {currentPage === 'gym-workouts' && !selectedGymWorkout && (
          <div className="gym-workouts-page">
            <div className="page-header">
              <h2>🏋️ Treinos na Academia</h2>
              <p>Exercícios com equipamentos para máximos resultados</p>
            </div>
            <div className="filter-buttons">
              {gymCategories.map((cat) => (
                <button key={cat} className={`filter-btn ${gymWorkoutFilter === cat ? 'active' : ''}`} onClick={() => setGymWorkoutFilter(cat)}>{cat}</button>
              ))}
            </div>
            <div className="gym-workouts-grid">
              {filteredGymWorkouts.map((workout) => (
                <div key={workout.id} className="gym-workout-card">
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{workout.image}</div>
                  <h3>{workout.name}</h3>
                  <div className="gym-meta">
                    <span className="badge badge-muscle">{workout.category}</span>
                    <span>🔁 {workout.sets}x{workout.reps}</span>
                    <span>⏸️ {workout.rest}</span>
                  </div>
                  <p className="gym-description">{workout.description}</p>
                  <button
                    className="select-btn"
                    disabled={userPlan === 'free' && completedWorkoutsCount >= 2}
                    onClick={() => { if (canStartWorkout()) { setSelectedGymWorkout(workout); setCompletedExercises([]); setTimerTime(0); setTimerActive(false); } }}
                  >
                    {userPlan === 'free' && completedWorkoutsCount >= 2 ? '🔒 PRO' : '▶️ Iniciar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACADEMIA - DETALHE */}
        {currentPage === 'gym-workouts' && selectedGymWorkout && (
          <div className="workout-details">
            <button className="back-btn" onClick={() => { setSelectedGymWorkout(null); setTimerActive(false); setTimerTime(0); }}>← Voltar</button>
            <div className="workout-details-header">
              <div className="workout-details-emoji">{selectedGymWorkout.image}</div>
              <div className="workout-details-info">
                <h2>{selectedGymWorkout.name}</h2>
                <div className="workout-badges" style={{ marginBottom: 8 }}>
                  <span className="badge badge-muscle">{selectedGymWorkout.category}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedGymWorkout.description}</p>
              </div>
            </div>
            <div className="gym-details">
              <div className="detail-box"><h4>Séries</h4><div className="big-number">{selectedGymWorkout.sets}</div></div>
              <div className="detail-box"><h4>Repetições</h4><div className="big-number">{selectedGymWorkout.reps}</div></div>
              <div className="detail-box"><h4>Descanso</h4><div className="big-number" style={{ fontSize: '1.4rem' }}>{selectedGymWorkout.rest}</div></div>
            </div>
            <div className="timer-section">
              <h3>⏱️ Cronômetro de Descanso</h3>
              <div className={getTimerClass()}>{formatTime(timerTime)}</div>
              <div className="timer-mode-selector">
                <button className={`timer-mode-btn ${timerMode === 'ascending' ? 'active' : ''}`} onClick={() => { setTimerMode('ascending'); setTimerTime(0); setTimerActive(false); }}>⬆️ Crescente</button>
                <button className={`timer-mode-btn ${timerMode === 'descending' ? 'active' : ''}`} onClick={() => { setTimerMode('descending'); setTimerActive(false); }}>⬇️ Regressivo</button>
              </div>
              {timerMode === 'descending' && (
                <div className="timer-set-time">
                  <label>Min:</label>
                  <input type="number" min="0" max="99" className="timer-time-input" value={timerSetMinutes} onChange={(e) => setTimerSetMinutes(Math.max(0, parseInt(e.target.value) || 0))} />
                  <label>Seg:</label>
                  <input type="number" min="0" max="59" className="timer-time-input" value={timerSetSeconds} onChange={(e) => setTimerSetSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} />
                </div>
              )}
              <div className="timer-buttons">
                {timerMode === 'descending' && !timerActive && timerTime === 0 ? (
                  <button className="timer-btn start" onClick={startDescendingTimer}>▶️ Iniciar</button>
                ) : (
                  <button className={`timer-btn ${timerActive ? '' : 'start'}`} onClick={() => setTimerActive(!timerActive)}>
                    {timerActive ? '⏸️ Pausar' : '▶️ Continuar'}
                  </button>
                )}
                <button className="timer-btn" onClick={() => { setTimerTime(0); setTimerActive(false); }}>🔄 Reiniciar</button>
              </div>
            </div>
            <button className="finish-btn" onClick={finishWorkout}>✅ Finalizar Treino</button>
          </div>
        )}



        {/* METAS */}
        {currentPage === 'goals' && (
          <div className="goals-page">
            <div className="page-header"><h2>🎯 Minhas Metas</h2><p>Defina seus objetivos e acompanhe seu progresso</p></div>
            <div className="goals-grid">
              {GOALS.map((goal) => (
                <div key={goal.id} className={`goal-card ${userGoal === goal.name ? 'active' : ''}`}
                  onClick={async () => { setUserGoal(goal.name); try { await updateDoc(doc(db, 'users', user.uid), { goal: goal.name }); } catch (e) {} }}>
                  <div className="goal-emoji">{goal.emoji}</div>
                  <h3>{goal.name}</h3>
                  <p>{goal.description}</p>
                  <div className="tips"><strong>Dicas:</strong><ul>{goal.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul></div>
                </div>
              ))}
            </div>
            {userGoal && (
              <div className="weekly-goals-section">
                <h3>📅 Metas Semanais — {userGoal}</h3>
                <div className="weekly-goals-grid">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                    <div key={day} className="weekly-goal-card">
                      <h4>{day}</h4>
                      <input type="text" placeholder="Meta" value={weeklyGoals[`${userGoal}-${day}`] || ''} onChange={(e) => saveWeeklyGoal(userGoal, day, e.target.value)} className="goal-input" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="progress-section">
              <h3>📊 Progresso Geral</h3>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min((completedWorkoutsCount / 50) * 100, 100)}%` }} /></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{completedWorkoutsCount} treinos concluídos de 50 (meta)</p>
            </div>
          </div>
        )}

        {/* LOJA */}
        {currentPage === 'store' && (
          <div className="store-page">
            <div className="page-header"><h2>🛒 Loja</h2><p>Produtos selecionados para potencializar seus treinos</p></div>
            {isAdminMaster && (
              <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="admin-btn">⚙️ {showAdminPanel ? 'Fechar Painel Admin' : 'Painel Admin'}</button>
            )}
            {showAdminPanel && isAdminMaster && (
              <div className="admin-panel">
                <h3>📝 Gerenciar Produtos</h3>
                <div className="product-form">
                  <h4>{editingProductId ? 'Editar Produto' : 'Adicionar Produto'}</h4>
                  <input type="text" placeholder="Nome do Produto" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="form-input" />
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="form-select">
                    {['Suplementos', 'Roupas', 'Acessórios', 'Equipamentos'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input type="number" placeholder="Preço (R$)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="form-input" step="0.01" />
                  <input type="text" placeholder="Emoji (ex: 💊)" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} className="form-input" maxLength="2" />
                  <input type="url" placeholder="URL da Imagem (ex: /img/products/suplementos/produto.jpg)" value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} className="form-input" />
                  <textarea placeholder="Descrição" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="form-textarea" />
                  <input type="url" placeholder="Link do produto" value={newProduct.link} onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })} className="form-input" />
                  <div className="form-buttons">
                    <button onClick={handleSaveProduct} className="save-btn">{editingProductId ? '✏️ Atualizar' : '➕ Adicionar'}</button>
                    {editingProductId && <button onClick={() => { setEditingProductId(null); setNewProduct({ name: '', category: 'Suplementos', price: '', image: '💊', imageUrl: '', description: '', link: '' }); }} className="cancel-btn">❌ Cancelar</button>}
                  </div>
                </div>
                <div className="products-management">
                  <h4>Produtos ({storeProducts.length})</h4>
                  {storeProducts.map((p) => (
                    <div key={p.id} className="product-management-item">
                      <div className="product-info">
                        <span style={{ fontSize: '1.5rem' }}>{p.image}</span>
                        <div className="product-details">
                          <p className="product-name">{p.name}</p>
                          <p className="product-category">{p.category}</p>
                          <p className="product-price">R$ {parseFloat(p.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="product-actions">
                        <button onClick={() => { setNewProduct(p); setEditingProductId(p.id); }} className="edit-btn">✏️</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="delete-btn">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {storeProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>🛒</p>
                <p>Nenhum produto disponível ainda.</p>
              </div>
            ) : (
              <div className="store-categories">
                {['Suplementos', 'Roupas', 'Acessórios', 'Equipamentos'].map((category) => {
                  const categoryProducts = storeProducts.filter(p => p.category === category);
                  if (categoryProducts.length === 0) return null;
                  return (
                    <div key={category} className="category-section">
                      <h3 className="category-title">{category}</h3>
                      <div className="products-grid">
                        {categoryProducts.map((product) => (
                          <div key={product.id} className="product-card">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="product-image" />
                            ) : (
                              <div className="product-emoji">{product.image}</div>
                            )}
                            <h3>{product.name}</h3>
                            <p className="description">{product.description}</p>
                            <p className="price">R$ {parseFloat(product.price).toFixed(2)}</p>
                            <a href={product.link} target="_blank" rel="noopener noreferrer" className="buy-btn">🛒 Comprar</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NUTRIÇÃO - 45 ESTILOS ALIMENTARES */}
        {currentPage === 'nutrition' && (
          <div className="nutrition-page">
            <div className="page-header">
              <h2>🍎 45 Estilos Alimentares</h2>
              <p>Escolha o estilo alimentar ideal para seus objetivos e necessidade</p>
            </div>
            <div className="diet-styles-grid">
              {DIET_STYLES.map((diet) => (
                <div key={diet.id} className="diet-style-card" onClick={() => setSelectedNutrition(selectedNutrition === diet.id ? null : diet.id)}>
                  <div className="diet-style-header">
                    <div className="diet-style-emoji">{diet.image}</div>
                    <div className="diet-style-info">
                      <h3>{diet.name}</h3>
                      <span className="diet-category">{diet.category}</span>
                    </div>
                  </div>
                  <p className="diet-description">{diet.description}</p>
                  {selectedNutrition === diet.id && (
                    <div className="diet-style-details">
                      <div className="diet-section">
                        <h4>✅ Benefícios</h4>
                        <ul>
                          {diet.benefits.map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="diet-section">
                        <h4>⚠️ Desvantagens</h4>
                        <ul>
                          {diet.disadvantages.map((disadvantage, idx) => (
                            <li key={idx}>{disadvantage}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="diet-section">
                        <h4>👥 Público Alvo</h4>
                        <p>{diet.targetAudience}</p>
                      </div>
                      <div className="diet-section">
                        <h4>🍽️ Exemplo de Refeições</h4>
                        <ul>
                          {diet.exampleMeals.map((meal, idx) => (
                            <li key={idx}>{meal}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="diet-section">
                        <h4>📊 Macronutrientes</h4>
                        <div className="macros-display">
                          <div className="macro-item">
                            <span className="macro-label">Proteína:</span>
                            <span className="macro-value">{diet.macros.protein}</span>
                          </div>
                          <div className="macro-item">
                            <span className="macro-label">Carboidratos:</span>
                            <span className="macro-value">{diet.macros.carbs}</span>
                          </div>
                          <div className="macro-item">
                            <span className="macro-label">Gordura:</span>
                            <span className="macro-value">{diet.macros.fat}</span>
                          </div>
                        </div>
                      </div>
                      <div className="diet-section">
                        <h4>🎯 Objetivos</h4>
                        <p>{diet.objectives}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCAÇÃO */}
        {currentPage === 'education' && (
          <div className="education-page">
            <div className="page-header"><h2>📚 Educação Fitness</h2><p>O que você precisa saber para treinar melhor e com mais segurança</p></div>
            <div className="education-grid">
              {EDUCATION_TIPS.map((tip) => (
                <div key={tip.id} className={`education-card ${expandedEducation === tip.id ? 'expanded' : ''}`} onClick={() => setExpandedEducation(expandedEducation === tip.id ? null : tip.id)}>
                  <div className="tip-emoji">{tip.emoji}</div>
                  <h3>{tip.title}</h3>
                  {expandedEducation === tip.id && (
                    <>
                      <p className="description">{tip.description}</p>
                      <div className="tips-list"><strong>Dicas práticas:</strong><ul>{tip.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
                      {tip.examples && (
                        <div className="examples-list"><strong>Exemplos práticos:</strong><ul>{tip.examples.map((ex, i) => <li key={i}>{ex}</li>)}</ul></div>
                      )}
                    </>
                  )}
                  {expandedEducation !== tip.id && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4 }}>Clique para expandir →</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI ASSISTANT */}
        {currentPage === 'ai-assistant' && (
          <div className="ai-assistant-page">
            <div className="page-header">
              <h2>🤖 IA Fitness</h2>
              <p>Seu assistente inteligente para treinos personalizados e nutrição</p>
            </div>
            <div className="ai-chat-container">
              <div className="ai-chat-messages">
                {aiMessages.map((msg) => (
                  <div key={msg.id} className={`ai-message ${msg.role}`}>
                    <div className="ai-message-avatar">{msg.role === 'assistant' ? '🤖' : '👤'}</div>
                    <div className="ai-message-content">
                      <div className="ai-message-text">{msg.content}</div>
                      <div className="ai-message-time">{new Date(msg.id).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="ai-message assistant">
                    <div className="ai-message-avatar">🤖</div>
                    <div className="ai-message-content">
                      <div className="ai-message-typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="ai-chat-input-container">
                <div className="ai-chat-input-wrapper">
                  <input
                    type="text"
                    placeholder="Pergunte sobre treinos, nutrição, metas..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiMessage()}
                    className="ai-chat-input"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={handleAiMessage}
                    className="ai-chat-send-btn"
                    disabled={aiLoading || !aiInput.trim()}
                  >
                    {aiLoading ? '⏳' : '➤'}
                  </button>
                </div>
                <div className="ai-chat-suggestions">
                  <button onClick={() => { setAiInput('Qual treino você recomenda para hoje?'); handleAiMessage(); }} className="ai-suggestion-btn">💪 Treino do dia</button>
                  <button onClick={() => { setAiInput('Como posso melhorar minha nutrição?'); handleAiMessage(); }} className="ai-suggestion-btn">🍎 Dica nutricional</button>
                  <button onClick={() => { setAiInput('Como alcançar minha meta mais rápido?'); handleAiMessage(); }} className="ai-suggestion-btn">🎯 Atingir meta</button>
                  <button onClick={() => { setAiInput('Exercícios para fazer em casa'); handleAiMessage(); }} className="ai-suggestion-btn">🏠 Treino casa</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERFIL */}
        {currentPage === 'profile' && (
          <div className="profile-page">
            <div className="page-header"><h2>👤 Meu Perfil</h2><p>Gerencie suas informações e configurações</p></div>
            <div className="profile-card">
              <div className="profile-avatar">
                {userProfile.photoURL ? <img src={userProfile.photoURL} alt="Avatar" /> : <div className="avatar-placeholder">👤</div>}
              </div>
              <div className="profile-info">
                <p><strong>Nome:</strong> {userProfile.name || 'Não definido'}</p>
                <p><strong>E-mail:</strong> {user.email}</p>
                <p><strong>Plano:</strong> {userPlan === 'pro' ? '💎 PRO' : '🆓 FREE'}</p>
                <p><strong>Treinos:</strong> {completedWorkoutsCount} concluídos</p>
                <p><strong>Meta:</strong> {userGoal || 'Não definida'}</p>
              </div>
            </div>
            <div className="profile-settings">
              <h3>⚙️ Configurações</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>Nome de Exibição</label>
                  <input type="text" placeholder="Seu nome" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="form-input" />
                </div>
                <button onClick={saveProfile} className="save-btn" disabled={savingProfile}>{savingProfile ? '⏳ Salvando...' : '💾 Salvar Perfil'}</button>
                <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>🌙 Tema</p>
                  <button onClick={() => setDarkMode(!darkMode)} className="filter-btn" style={{ width: '100%' }}>{darkMode ? '☀️ Mudar para Modo Claro' : '🌙 Mudar para Modo Escuro'}</button>
                </div>
                {userPlan === 'free' && (
                  <button onClick={() => setShowUpgradeModal(true)} className="upgrade-btn" style={{ width: '100%', justifyContent: 'center' }}>💎 Fazer Upgrade para PRO — R$ 9,99</button>
                )}
                {isAdminMaster && (
                  <div style={{ marginTop: 16, padding: 16, background: 'rgba(124, 58, 237, 0.1)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>🔐 Acesso Master</p>
                    <button onClick={() => setShowAdminPaymentPanel(!showAdminPaymentPanel)} className="save-btn" style={{ width: '100%', justifyContent: 'center' }}>💳 Painel de Pagamentos</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL UPGRADE PRO */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => { if (!processingPayment) setShowUpgradeModal(false); }}>
          <div className="modal upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { if (!processingPayment) setShowUpgradeModal(false); }}>×</button>
            <h2>💎 Upgrade para PRO</h2>
            <p>Desbloqueie treinos ilimitados e todas as funcionalidades premium</p>

            <div className="plan-comparison">
              <div className="plan-option">
                <h4>🆓 FREE</h4>
                <div className="plan-price">R$ 0</div>
                <ul className="plan-features">
                  <li>2 treinos por mês</li>
                  <li>Nutrição básica</li>
                  <li>Metas simples</li>
                </ul>
              </div>
              <div className="plan-option selected">
                <h4>💎 PRO</h4>
                <div className="plan-price">R$ 9,99<span>/mês</span></div>
                <ul className="plan-features">
                  <li>✅ Treinos ilimitados</li>
                  <li>✅ Todos os recursos</li>
                  <li>✅ Suporte prioritário</li>
                  <li>✅ Sem anúncios</li>
                </ul>
              </div>
            </div>

            <div className="payment-tabs">
              <button className={`tab-btn ${paymentTab === 'pix' ? 'active' : ''}`} onClick={() => setPaymentTab('pix')}>🏦 PIX</button>
              <button className={`tab-btn ${paymentTab === 'card' ? 'active' : ''}`} onClick={() => setPaymentTab('card')}>💳 Cartão</button>
            </div>

            {paymentTab === 'pix' && (
              <div className="pix-payment-container">
                <div className="pix-qr-wrapper">
                  <QRCodeSVG value={PIX_PAYLOAD} size={190} level="M" includeMargin={false} style={{ display: 'block' }} />
                </div>
                <div className="pix-info">
                  <div className="pix-info-row"><span className="label">Beneficiário</span><span className="value">AuraFit Pro</span></div>
                  <div className="pix-info-row"><span className="label">Banco</span><span className="value">Nubank</span></div>
                  <div className="pix-info-row"><span className="label">Valor</span><span className="value price">R$ 9,99</span></div>
                  <div className="pix-info-row"><span className="label">Descrição</span><span className="value">AuraFit PRO — 1 mês</span></div>
                </div>
                <div className="pix-instructions">
                  <h4>📱 Como pagar:</h4>
                  <ol>
                    <li>Abra o app do seu banco</li>
                    <li>Vá em Pix → Pagar com QR Code</li>
                    <li>Escaneie o código acima</li>
                    <li>Confirme o pagamento de R$ 9,99</li>
                    <li>Informe o código de confirmação abaixo</li>
                  </ol>
                </div>
                {pixPending ? (
                  <div className="payment-pending-notice">⏳ Seu pagamento está em análise. Assim que confirmado, seu plano PRO será ativado automaticamente. Aguarde até 24h.</div>
                ) : (
                  <>
                    <div className="form-group" style={{ width: '100%' }}>
                      <label>Código de Confirmação (últimos 4 dígitos do comprovante)</label>
                      <input type="text" placeholder="Ex: 1234" value={pixConfirmCode} onChange={(e) => setPixConfirmCode(e.target.value)} className="form-input" maxLength="20" disabled={processingPayment} />
                    </div>
                    <button className="pix-confirm-btn" onClick={handlePixConfirm} disabled={processingPayment}>
                      {processingPayment ? '⏳ Verificando...' : '✅ Já Paguei — Confirmar'}
                    </button>
                    <div className="payment-pending-notice">⚠️ O plano PRO só será ativado após confirmação do pagamento. Não é possível ativar sem pagamento real.</div>
                  </>
                )}
              </div>
            )}

            {paymentTab === 'card' && (
              <div className="card-payment-form">
                <div className="form-group">
                  <label>Nome no Cartão</label>
                  <input type="text" placeholder="NOME COMPLETO" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className="card-input" disabled={processingPayment} />
                </div>
                <div className="form-group">
                  <label>Número do Cartão</label>
                  <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => { let v = e.target.value.replace(/\D/g, '').slice(0, 16); v = v.replace(/(.{4})/g, '$1 ').trim(); setCardNumber(v); }} maxLength="19" className="card-input" disabled={processingPayment} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Validade</label>
                    <input type="text" placeholder="MM/AA" value={cardExpiry} onChange={(e) => { let v = e.target.value.replace(/\D/g, ''); if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4); setCardExpiry(v); }} maxLength="5" className="card-input" disabled={processingPayment} />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" value={cardCVC} onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength="4" className="card-input" disabled={processingPayment} />
                  </div>
                </div>
                <div className="payment-pending-notice">⚠️ O plano PRO só será ativado após confirmação real do pagamento pelo administrador.</div>
                <div className="modal-buttons">
                  <button onClick={() => setShowUpgradeModal(false)} className="cancel-btn" disabled={processingPayment}>Cancelar</button>
                  <button onClick={handleCardPayment} className="upgrade-confirm-btn" disabled={processingPayment}>{processingPayment ? '⏳ Processando...' : '💳 Pagar R$ 9,99'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ADMIN - DADOS BANCÁRIOS */}
      {showAdminPaymentPanel && isAdminMaster && (
        <div className="modal-overlay" onClick={() => setShowAdminPaymentPanel(false)}>
          <div className="modal admin-payment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAdminPaymentPanel(false)}>×</button>
            <h2>💳 Dados para Recebimento</h2>
            <p>Configure como você deseja receber os pagamentos</p>
            <div className="payment-tabs">
              <button className={`tab-btn ${paymentMethodTab === 'payments' ? 'active' : ''}`} onClick={() => setPaymentMethodTab('payments')}>📋 Pagamentos Pendentes</button>
              <button className={`tab-btn ${paymentMethodTab === 'pix' ? 'active' : ''}`} onClick={() => setPaymentMethodTab('pix')}>PIX</button>
              <button className={`tab-btn ${paymentMethodTab === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethodTab('card')}>Cartão</button>
              <button className={`tab-btn ${paymentMethodTab === 'bank' ? 'active' : ''}`} onClick={() => setPaymentMethodTab('bank')}>Conta</button>
            </div>
            {paymentMethodTab === 'payments' && (
              <div className="payment-method-form">
                <h3>📋 Pagamentos Aguardando Aprovação</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Clique em "Aprovar" para liberar o acesso PRO ao usuário</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>💡 Dica: Verificar pagamentos no Firebase</p>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>1. Acesse o Firebase Console</p>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>2. Vá para Firestore Database → payments</p>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>3. Altere o campo "status" para "approved"</p>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>4. O usuário receberá PRO automaticamente no próximo login</p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethodTab === 'pix' && (
              <div className="payment-method-form">
                <h3>Dados do PIX</h3>
                <div className="form-group">
                  <label>Tipo de Chave</label>
                  <select value={adminBankData.pixKeyType} onChange={(e) => setAdminBankData({ ...adminBankData, pixKeyType: e.target.value })} className="form-select">
                    <option value="random">Chave Aleatória</option>
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Chave PIX</label>
                  <input type="text" placeholder="Sua chave PIX" value={adminBankData.pixKey} onChange={(e) => setAdminBankData({ ...adminBankData, pixKey: e.target.value })} className="form-input" />
                </div>
                <button onClick={async () => { try { await updateDoc(doc(db, 'users', user.uid), { 'paymentMethods.pix': { keyType: adminBankData.pixKeyType, key: adminBankData.pixKey } }); addToast('Dados do PIX salvos!', 'success', '✅'); } catch (e) { addToast('Erro ao salvar', 'error', '❌'); } }} className="save-btn">💾 Salvar PIX</button>
              </div>
            )}
            {paymentMethodTab === 'card' && (
              <div className="payment-method-form">
                <h3>Dados do Cartão</h3>
                <div className="form-group"><label>Titular</label><input type="text" placeholder="Nome completo" value={adminBankData.cardholderName} onChange={(e) => setAdminBankData({ ...adminBankData, cardholderName: e.target.value })} className="form-input" /></div>
                <div className="form-group"><label>Número</label><input type="text" placeholder="0000 0000 0000 0000" value={adminBankData.cardNumber} onChange={(e) => setAdminBankData({ ...adminBankData, cardNumber: e.target.value })} className="form-input" /></div>
                <div className="form-row">
                  <div className="form-group"><label>Validade</label><input type="text" placeholder="MM/AA" value={adminBankData.cardExpiry} onChange={(e) => setAdminBankData({ ...adminBankData, cardExpiry: e.target.value })} className="form-input" /></div>
                  <div className="form-group"><label>CVV</label><input type="text" placeholder="123" value={adminBankData.cardCVC} onChange={(e) => setAdminBankData({ ...adminBankData, cardCVC: e.target.value })} className="form-input" /></div>
                </div>
                <button onClick={async () => { try { await updateDoc(doc(db, 'users', user.uid), { 'paymentMethods.card': { cardholderName: adminBankData.cardholderName } }); addToast('Dados do cartão salvos!', 'success', '✅'); } catch (e) { addToast('Erro ao salvar', 'error', '❌'); } }} className="save-btn">💾 Salvar Cartão</button>
              </div>
            )}
            {paymentMethodTab === 'bank' && (
              <div className="payment-method-form">
                <h3>Conta Bancária</h3>
                <div className="form-group"><label>Banco</label><input type="text" placeholder="Ex: Nubank" value={adminBankData.bankName} onChange={(e) => setAdminBankData({ ...adminBankData, bankName: e.target.value })} className="form-input" /></div>
                <div className="form-row">
                  <div className="form-group"><label>Agência</label><input type="text" placeholder="0001" value={adminBankData.agencyNumber} onChange={(e) => setAdminBankData({ ...adminBankData, agencyNumber: e.target.value })} className="form-input" /></div>
                  <div className="form-group"><label>Conta</label><input type="text" placeholder="123456" value={adminBankData.accountNumber} onChange={(e) => setAdminBankData({ ...adminBankData, accountNumber: e.target.value })} className="form-input" /></div>
                </div>
                <button onClick={async () => { try { await updateDoc(doc(db, 'users', user.uid), { 'paymentMethods.bank': { bankName: adminBankData.bankName } }); addToast('Dados bancários salvos!', 'success', '✅'); } catch (e) { addToast('Erro ao salvar', 'error', '❌'); } }} className="save-btn">💾 Salvar Conta</button>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
