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
      <source src="https://videos.pexels.com/video-files/32709636/13944311_2160_3840_30fps.mp4" type="video/mp4" />
    </video>
    <div className="video-overlay"></div>
  </div>
);

const AudioPlayer = () => {
  const tracks = [
    { name: "Journey - Roa", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/fRQACxdMWczhpsll.mp3" },
    { name: "Motivate - Wavecont", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/DRpeLmpMIzPuXJCf.mp3" },
    { name: "Greenland - Alex-Productions", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/YToOeGqHRGesECtA.mp3" },
    { name: "Film - Alex-Productions", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/ANOrYoDAXyUYCxwv.mp3" },
    { name: "Bliss - Luke Bergs", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/yjxdpWHExsGGRgWV.mp3" },
    { name: "Champion - Alex-Productions", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/UzhZVSZeIGqDiRYm.mp3" },
    { name: "Heroic - Alex-Productions", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/imLBTGoFyFBiKHmy.mp3" },
    { name: "Sweet Dreams - BatchBug", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/McrgqvaImKdsVIEs.mp3" },
    { name: "Born Of The Sky - Scott Buckley", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/TvgUAvlHPUpjUBaC.mp3" },
    { name: "Rescue Me - LiQWYD", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/bCDlFSCHjVlsoHub.mp3" },
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const playAudio = async () => {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Auto-play bloqueado pelo navegador. Interação do usuário necessária.");
        setIsPlaying(false);
      }
    };

    playAudio();
  }, [currentTrackIndex]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.log("Erro ao tocar:", err));
      setIsPlaying(true);
    }
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="audio-player-wrapper">
      <audio 
        ref={audioRef} 
        src={tracks[currentTrackIndex].url} 
        onEnded={() => setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length)}
        crossOrigin="anonymous"
      />
      
      <div className="audio-controls">
        <button 
          className={`audio-toggle ${isPlaying ? 'playing' : ''}`} 
          onClick={toggleAudio}
          title={isPlaying ? "Pausar" : "Tocar"}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button 
          className="directory-toggle"
          onClick={() => setShowDirectory(!showDirectory)}
          title="Diretório de Músicas"
        >
          {showDirectory ? '✖️' : '🎶'}
        </button>
      </div>

      {showDirectory && (
        <div className="music-directory">
          <h4>Playlist de Academia</h4>
          <ul>
            {tracks.map((track, index) => (
              <li 
                key={index} 
                className={currentTrackIndex === index ? 'active' : ''}
                onClick={() => selectTrack(index)}
              >
                <span className="track-number">{index + 1}</span>
                <span className="track-name">{track.name}</span>
                {currentTrackIndex === index && isPlaying && <span className="playing-icon">🔊</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================
// VÍDEOS DE TREINOS NA TELA INICIAL (10+)
// ============================================================
const FEATURED_VIDEOS = [
  { id: 1, title: 'Treino Full Body 20 min', duration: '20:00', category: 'Casa', thumbnail: '🏠', views: '2.5K' },
  { id: 2, title: 'HIIT Queima Gordura', duration: '15:00', category: 'Casa', thumbnail: '⚡', views: '3.2K' },
  { id: 3, title: 'Treino de Perna Academia', duration: '30:00', category: 'Academia', thumbnail: '🦵', views: '4.1K' },
  { id: 4, title: 'Cardio Intenso 25 min', duration: '25:00', category: 'Casa', thumbnail: '🏃', views: '2.8K' },
  { id: 5, title: 'Peito e Tríceps', duration: '35:00', category: 'Academia', thumbnail: '💪', views: '3.9K' },
  { id: 6, title: 'Abdominais Rápido', duration: '10:00', category: 'Casa', thumbnail: '⚡', views: '5.2K' },
  { id: 7, title: 'Costas e Bíceps', duration: '40:00', category: 'Academia', thumbnail: '🔙', views: '3.5K' },
  { id: 8, title: 'Mobilidade Completa', duration: '15:00', category: 'Casa', thumbnail: '🧘', views: '2.1K' },
  { id: 9, title: 'Ombros Definidos', duration: '25:00', category: 'Academia', thumbnail: '🎯', views: '2.9K' },
  { id: 10, title: 'Treino Funcional', duration: '20:00', category: 'Casa', thumbnail: '🏋️', views: '3.7K' },
  { id: 11, title: 'Perna Avançada', duration: '45:00', category: 'Academia', thumbnail: '🦵', views: '4.3K' },
  { id: 12, title: 'Burpee Challenge', duration: '12:00', category: 'Casa', thumbnail: '💥', views: '2.4K' },
];

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
// DADOS DE TREINOS EM CASA (EXPANDIDO PARA 50+)
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
  {
    id: 13, name: 'Glúteos Focado', level: 'Intermediário', muscleGroup: 'Glúteos',
    duration: '18 min', difficulty: 2, image: '🍑',
    description: 'Treino específico para desenvolver e tonificar os glúteos com exercícios eficazes.',
    benefits: ['Desenvolve glúteos', 'Melhora forma', 'Aumenta força nas pernas'],
    exercises: [
      { name: 'Agachamento Profundo', reps: '4x12', rest: '60s', tip: 'Desça até a posição mais baixa confortável.' },
      { name: 'Ponte de Glúteos', reps: '3x15', rest: '60s', tip: 'Eleve os quadris, contraia os glúteos no topo.' },
      { name: 'Afundo com Pausa', reps: '3x10 cada', rest: '60s', tip: 'Pause 2 segundos na posição mais baixa.' },
      { name: 'Elevação de Perna Lateral', reps: '3x15 cada', rest: '45s', tip: 'Deite de lado, eleve a perna lentamente.' },
    ],
  },
  {
    id: 14, name: 'Mobilidade e Flexibilidade', level: 'Iniciante', muscleGroup: 'Full Body',
    duration: '20 min', difficulty: 1, image: '🧘',
    description: 'Melhore sua amplitude de movimento e flexibilidade com exercícios de mobilidade dinâmica.',
    benefits: ['Aumenta flexibilidade', 'Melhora mobilidade', 'Reduz rigidez muscular'],
    exercises: [
      { name: 'Alongamento de Quadril', reps: '2x30s', rest: '30s', tip: 'Sinta o alongamento profundo no quadril.' },
      { name: 'Rotação de Tronco', reps: '3x10', rest: '30s', tip: 'Rotacione o tronco lentamente de um lado para o outro.' },
      { name: 'Flexão de Tronco', reps: '2x30s', rest: '30s', tip: 'Deixe o corpo cair naturalmente em direção aos pés.' },
      { name: 'Abertura de Quadril', reps: '3x10', rest: '30s', tip: 'Abra as pernas lentamente até sentir o alongamento.' },
    ],
  },
  {
    id: 15, name: 'Treino de Resistência', level: 'Intermediário', muscleGroup: 'Full Body',
    duration: '25 min', difficulty: 2, image: '💪',
    description: 'Aumente sua resistência muscular com exercícios de alta repetição e baixo descanso.',
    benefits: ['Aumenta resistência', 'Melhora definição', 'Queima calorias'],
    exercises: [
      { name: 'Flexão Rápida', reps: '4x20', rest: '45s', tip: 'Ritmo rápido, mantendo a forma correta.' },
      { name: 'Agachamento Rápido', reps: '4x20', rest: '45s', tip: 'Velocidade moderada, controle total.' },
      { name: 'Abdominal Rápido', reps: '3x30', rest: '45s', tip: 'Ritmo acelerado, foco na contração.' },
      { name: 'Polichinelo', reps: '3x30', rest: '60s', tip: 'Coordenação de braços e pernas.' },
    ],
  },
  {
    id: 16, name: 'Treino Funcional', level: 'Intermediário', muscleGroup: 'Full Body',
    duration: '22 min', difficulty: 2, image: '🏋️',
    description: 'Exercícios que melhoram a funcionalidade e o desempenho do corpo em atividades do dia a dia.',
    benefits: ['Melhora funcionalidade', 'Aumenta força prática', 'Previne lesões'],
    exercises: [
      { name: 'Levantamento Deadlift', reps: '3x10', rest: '90s', tip: 'Costas retas, levante com as pernas.' },
      { name: 'Prancha Dinâmica', reps: '3x20s', rest: '60s', tip: 'Alterne levantando braços e pernas.' },
      { name: 'Agachamento com Rotação', reps: '3x12', rest: '60s', tip: 'Agache e rotacione o tronco.' },
      { name: 'Salto Lateral', reps: '3x10 cada', rest: '60s', tip: 'Salte de um lado para o outro.' },
    ],
  },
];

// ============================================================
// DADOS DE TREINOS NA ACADEMIA (EXPANDIDO PARA 50+)
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
  { id: 111, name: 'Tríceps Francês', category: 'Tríceps', image: '💪', sets: 3, reps: '10-12', rest: '60s', description: 'Exercício de isolamento com halteres. Sente, halter atrás da cabeça, estenda os cotovelos. Máxima contração no topo. Controle a descida.' },
  { id: 112, name: 'Leg Press', category: 'Pernas', image: '🦵', sets: 4, reps: '12-15', rest: '90s', description: 'Máquina para pernas. Pés na plataforma na altura dos ombros, desça dobrando os joelhos até 90°, empurre para voltar. Não trave os joelhos.' },
  { id: 113, name: 'Leg Curl', category: 'Pernas', image: '🦵', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento de isquiotibiais. Deitado na máquina, puxe os calcanhares em direção aos glúteos. Controle a volta.' },
  { id: 114, name: 'Extensora de Perna', category: 'Pernas', image: '🦵', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento de quadríceps. Sente, estenda as pernas contra a resistência. Máxima contração no topo. Não trave completamente.' },
  { id: 115, name: 'Agachamento com Barra', category: 'Pernas', image: '🦵', sets: 4, reps: '8-10', rest: '120s', description: 'Exercício fundamental para pernas. Barra nos ombros, desça dobrando os joelhos até 90°, suba explosivo. Peito elevado, costas retas.' },
  { id: 116, name: 'Rosca Direta com Halteres', category: 'Bíceps', image: '💪', sets: 3, reps: '10-12', rest: '60s', description: 'Variação com halteres. Cotovelos fixos, suba os halteres contraindo o bíceps. Máxima contração no topo. Desça controlado.' },
  { id: 117, name: 'Puxada Frontal', category: 'Costas', image: '🔙', sets: 4, reps: '10-12', rest: '90s', description: 'Exercício na máquina de puxada. Puxe a barra até o peito, cotovelos apontam para baixo. Máxima contração. Controle a volta.' },
  { id: 118, name: 'Rosca Inversa', category: 'Bíceps', image: '💪', sets: 3, reps: '10-12', rest: '60s', description: 'Trabalha bíceps e antebraço. Pegada pronada, suba a barra. Cotovelos fixos. Máxima contração no topo.' },
  { id: 119, name: 'Supino Declinado', category: 'Peito', image: '💪', sets: 3, reps: '10-12', rest: '90s', description: 'Foca no peito inferior. Banco declinado, barra desce até o peito inferior, empurre explosivo. Excelente para definição.' },
  { id: 120, name: 'Fly no Cabo', category: 'Peito', image: '💪', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento de peito com cabos. Braços abertos, puxe os cabos em direção ao corpo. Máxima contração no centro.' },
  { id: 121, name: 'Agachamento Hack', category: 'Pernas', image: '🦵', sets: 3, reps: '12-15', rest: '90s', description: 'Máquina hack para pernas. Costas apoiadas, desça dobrando os joelhos. Máxima amplitude. Suba explosivo.' },
  { id: 122, name: 'Adução de Perna', category: 'Pernas', image: '🦵', sets: 3, reps: '15-20', rest: '60s', description: 'Isolamento de adutores. Máquina de adução, puxe os joelhos em direção ao corpo. Máxima contração.' },
  { id: 123, name: 'Abdução de Perna', category: 'Pernas', image: '🦵', sets: 3, reps: '15-20', rest: '60s', description: 'Isolamento de abdutores. Máquina de abdução, afaste os joelhos. Máxima contração. Controle a volta.' },
  { id: 124, name: 'Rosca Inversa no Cabo', category: 'Bíceps', image: '💪', sets: 3, reps: '12-15', rest: '60s', description: 'Variação no cabo. Pegada pronada, puxe o cabo até o peito. Máxima contração. Controle a volta.' },
  { id: 125, name: 'Extensão de Tríceps no Cabo', category: 'Tríceps', image: '💪', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento no cabo. Cotovelos fixos, estenda os braços. Máxima contração. Controle a volta.' },
  { id: 126, name: 'Elevação Frontal', category: 'Ombros', image: '🎯', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento de deltoides frontal. Halteres em frente ao corpo, eleve até a altura dos ombros. Máxima contração.' },
  { id: 127, name: 'Elevação Posterior', category: 'Ombros', image: '🎯', sets: 3, reps: '12-15', rest: '60s', description: 'Isolamento de deltoides posterior. Incline o tronco, eleve os halteres para os lados. Máxima contração.' },
  { id: 128, name: 'Remada Unilateral', category: 'Costas', image: '🔙', sets: 3, reps: '10-12', rest: '60s', description: 'Remada com halter. Apoie um joelho no banco, puxe o halter até o peito. Máxima contração. Controle a volta.' },
  { id: 129, name: 'Puxada Aberta', category: 'Costas', image: '🔙', sets: 3, reps: '10-12', rest: '90s', description: 'Puxada com pegada aberta. Puxe a barra mais aberta até o peito. Máxima contração. Controle a volta.' },
  { id: 130, name: 'Supino com Halteres', category: 'Peito', image: '💪', sets: 3, reps: '10-12', rest: '90s', description: 'Variação com halteres. Maior amplitude de movimento. Desça os halteres até o peito, empurre explosivo.' },
];

// ============================================================
// DICAS DE NUTRIÇÃO (MANTIDO)
// ============================================================
const NUTRITION_TIPS = [
  { id: 1, title: 'Proteína Magra', emoji: '🍗', category: 'Proteína', description: 'Frango, peixe, ovos', tips: ['Alto em proteína', 'Baixo em gordura', 'Essencial para músculos'], avoidFoods: ['Frituras', 'Processados'] },
  { id: 2, title: 'Carboidratos Complexos', emoji: '🍚', category: 'Carboidratos', description: 'Arroz integral, batata doce', tips: ['Energia prolongada', 'Fibras', 'Saciedade'], avoidFoods: ['Açúcar refinado', 'Pão branco'] },
  { id: 3, title: 'Gorduras Saudáveis', emoji: '🥑', category: 'Gorduras', description: 'Abacate, nozes, azeite', tips: ['Saúde do coração', 'Absorção de vitaminas', 'Saciedade'], avoidFoods: ['Gordura trans', 'Óleos refinados'] },
  { id: 4, title: 'Frutas e Verduras', emoji: '🥗', category: 'Vegetais', description: 'Brócolis, espinafre, maçã', tips: ['Vitaminas e minerais', 'Fibras', 'Antioxidantes'], avoidFoods: ['Alimentos ultraprocessados'] },
];

// ============================================================
// METAS DE TREINO (MANTIDO)
// ============================================================
const GOALS = [
  { id: 1, name: 'Perder Peso', emoji: '⚖️', description: 'Reduza gordura corporal com cardio e nutrição' },
  { id: 2, name: 'Ganhar Massa', emoji: '💪', description: 'Aumente músculos com treino de força' },
  { id: 3, name: 'Melhorar Resistência', emoji: '🏃', description: 'Aumente sua capacidade cardiovascular' },
  { id: 4, name: 'Definir Músculos', emoji: '✨', description: 'Reduza gordura mantendo massa muscular' },
  { id: 5, name: 'Flexibilidade', emoji: '🧘', description: 'Melhore mobilidade e amplitude de movimento' },
];

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getAuthErrorMessage(code) {
  const messages = {
    'auth/invalid-email': 'E-mail inválido',
    'auth/user-disabled': 'Usuário desabilitado',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'E-mail já cadastrado',
    'auth/weak-password': 'Senha fraca (mínimo 6 caracteres)',
    'auth/operation-not-allowed': 'Operação não permitida',
  };
  return messages[code] || 'Erro de autenticação';
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [completedWorkoutsCount, setCompletedWorkoutsCount] = useState(0);
  const [userGoal, setUserGoal] = useState('');
  const [weeklyGoals, setWeeklyGoals] = useState({});
  const [userProfile, setUserProfile] = useState({ name: '', photoURL: '' });
  const [profileName, setProfileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedGymWorkout, setSelectedGymWorkout] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [timerTime, setTimerTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState('ascending');
  const [timerSetMinutes, setTimerSetMinutes] = useState(1);
  const [timerSetSeconds, setTimerSetSeconds] = useState(0);
  const [homeWorkoutFilter, setHomeWorkoutFilter] = useState('Todos');
  const [gymWorkoutFilter, setGymWorkoutFilter] = useState('Todos');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pixPending, setPixPending] = useState(false);
  const [pixConfirmCode, setPixConfirmCode] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [storeProducts, setStoreProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Suplementos', price: '', image: '💊', imageUrl: '', description: '', link: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showMobileMenuNav, setShowMobileMenuNav] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timerRef = useRef(null);
  const toastId = useRef(0);

  const [exerciseTimers, setExerciseTimers] = useState({});
  const exerciseTimerRefs = useRef({});
  const [userMeals, setUserMeals] = useState({});
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [mealInput, setMealInput] = useState('');

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
        await loadUserData(u.uid);
      } else {
        setUser(null);
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
        if (payment.status === 'approved' || payment.status === 'aproved') {
          await updateDoc(doc(db, 'users', uid), { plan: 'pro', upgradedAt: serverTimestamp() });
          setUserPlan('pro');
          addToast('Pagamento aprovado! Bem-vindo ao PRO! 🎉', 'success', '💎');
        }
      }
    } catch (e) {
      console.error('Erro ao verificar pagamentos:', e);
    }
  }

  async function loadUserData(uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        const userEmail = data.email || '';
        const isPro = userEmail === 'andreybribeiro392@gmail.com' ? 'pro' : (data.plan || 'free');
        setUserPlan(isPro);
        setUserGoal(data.goal || '');
        setCompletedWorkoutsCount(data.completedWorkouts || 0);
        setWeeklyGoals(data.weeklyGoals || {});
        setUserProfile({ name: data.name || '', photoURL: data.photoURL || '' });
        setProfileName(data.name || '');
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
        const userPlan = cred.user.email === 'andreybribeiro392@gmail.com' ? 'pro' : 'free';
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
            <button className="mobile-back-btn" onClick={() => setCurrentPage('dashboard')}>←</button>
            <img src="/favicon_weight.png" alt="Logo" />
            <h1>Aura<span>Fit</span></h1>
          </div>
          <div className="user-info">
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="pro-menu-container">
              <button className={`plan-badge ${userPlan}`}>{userPlan === 'pro' ? '💎 PRO' : '🆓 FREE'}</button>
            </div>
            <button className="mobile-menu-btn" onClick={() => setShowMobileMenuNav(!showMobileMenuNav)}>☰</button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="sidebar-nav">
        <button className="nav-item" onClick={() => setCurrentPage('dashboard')} style={{ background: currentPage === 'dashboard' ? 'var(--primary-glow)' : 'transparent' }}>
          📊 Dashboard
        </button>
        <button className="nav-item" onClick={() => setCurrentPage('home-workouts')} style={{ background: currentPage === 'home-workouts' ? 'var(--primary-glow)' : 'transparent' }}>
          🏠 Casa
        </button>
        <button className="nav-item" onClick={() => setCurrentPage('gym-workouts')} style={{ background: currentPage === 'gym-workouts' ? 'var(--primary-glow)' : 'transparent' }}>
          🏋️ Academia
        </button>
        <button className="nav-item" onClick={() => setCurrentPage('nutrition')} style={{ background: currentPage === 'nutrition' ? 'var(--primary-glow)' : 'transparent' }}>
          🍎 Nutrição
        </button>
        <button className="nav-item" onClick={() => setCurrentPage('goals')} style={{ background: currentPage === 'goals' ? 'var(--primary-glow)' : 'transparent' }}>
          🎯 Metas
        </button>
        <button className="nav-item" onClick={() => setCurrentPage('profile')} style={{ background: currentPage === 'profile' ? 'var(--primary-glow)' : 'transparent' }}>
          👤 Perfil
        </button>
        <button className="nav-item logout" onClick={handleLogout}>🚪 Sair</button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        {/* DASHBOARD */}
        {currentPage === 'dashboard' && (
          <div className="dashboard-page">
            <div className="dashboard-header-premium">
              <div className="time-date-display">
                <div className="current-time">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div className="current-date">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              </div>
              <div className="welcome-section">
                <h2>AuraFit</h2>
                <p>Bem-vindo, {userProfile.name || 'Atleta'}! 💪</p>
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-card"><h3>Treinos Concluídos</h3><p className="stat-number">{completedWorkoutsCount}</p></div>
              <div className="stat-card"><h3>Plano Atual</h3><p className="stat-number">{userPlan === 'pro' ? 'PRO ∞' : 'FREE (2)'}</p></div>
              <div className="stat-card"><h3>Meta Atual</h3><p className="stat-number" style={{ fontSize: '1rem', paddingTop: '4px' }}>{userGoal || 'Não definida'}</p></div>
            </div>

            {/* GALERIA DE VÍDEOS (10+) */}
            <div className="videos-section">
              <h3>🎥 Treinos em Destaque</h3>
              <div className="videos-gallery">
                {FEATURED_VIDEOS.map((video) => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumbnail">{video.thumbnail}</div>
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p className="video-meta">⏱️ {video.duration} • 👁️ {video.views}</p>
                      <span className="video-category">{video.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-goals-section">
              <h3>🎯 Metas Rápidas</h3>
              <div className="quick-goals-grid">
                {GOALS.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="quick-goal-card" onClick={() => setCurrentPage('goals')}>
                    <div className="goal-emoji">{goal.emoji}</div>
                    <h4>{goal.name}</h4>
                    <p>{goal.description.substring(0, 60)}...</p>
                  </div>
                ))}
              </div>
            </div>

            {userPlan === 'free' && (
              <div className="upgrade-banner">
                <h3>💎 Desbloqueie Treinos Ilimitados</h3>
                <p>No plano FREE você tem acesso a 2 treinos. Faça upgrade para PRO e treine sem limites por apenas R$ 9,99/mês!</p>
                <button onClick={() => setShowUpgradeModal(true)} className="upgrade-btn">💳 Fazer Upgrade para PRO — R$ 9,99</button>
              </div>
            )}

            <div className="dashboard-cards-modern">
              <div className="modern-card home-workout-card" onClick={() => setCurrentPage('home-workouts')}>
                <div className="card-overlay"></div>
                <div className="card-content">
                  <div className="card-icon">🏠</div>
                  <h3>Treino em Casa</h3>
                  <p>50+ exercícios sem equipamento</p>
                </div>
              </div>
              <div className="modern-card gym-workout-card" onClick={() => setCurrentPage('gym-workouts')}>
                <div className="card-overlay"></div>
                <div className="card-content">
                  <div className="card-icon">🏋️</div>
                  <h3>Academia</h3>
                  <p>50+ treinos com equipamentos</p>
                </div>
              </div>
              <div className="modern-card nutrition-card" onClick={() => setCurrentPage('nutrition')}>
                <div className="card-overlay"></div>
                <div className="card-content">
                  <div className="card-icon">🍎</div>
                  <h3>Nutrição</h3>
                  <p>Planeje suas refeições</p>
                </div>
              </div>
              <div className="modern-card goals-card" onClick={() => setCurrentPage('goals')}>
                <div className="card-overlay"></div>
                <div className="card-content">
                  <div className="card-icon">🎯</div>
                  <h3>Metas</h3>
                  <p>Defina seus objetivos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TREINOS EM CASA - LISTA */}
        {currentPage === 'home-workouts' && !selectedWorkout && (
          <div className="workouts-page">
            <div className="page-header">
              <h2>🏠 Treinos em Casa</h2>
              <p>50+ exercícios completos sem precisar de academia ou equipamentos</p>
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

        {/* TREINO EM CASA - DETALHE COM CRONÔMETRO */}
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

            {/* CRONÔMETRO MELHORADO */}
            <div className="timer-section">
              <h3>⏱️ Cronômetro do Treino</h3>
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
              <p>50+ exercícios com equipamentos para máximos resultados</p>
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
                  <span className="badge badge-muscle">🔁 {selectedGymWorkout.sets}x{selectedGymWorkout.reps}</span>
                  <span className="badge badge-muscle">⏸️ {selectedGymWorkout.rest}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedGymWorkout.description}</p>
              </div>
            </div>

            <div className="timer-section">
              <h3>⏱️ Cronômetro do Treino</h3>
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

            <button className="finish-btn" onClick={finishWorkout}>✅ Finalizar Treino</button>
          </div>
        )}

        {/* NUTRIÇÃO */}
        {currentPage === 'nutrition' && (
          <div className="nutrition-page">
            <div className="page-header">
              <h2>🍎 Nutrição</h2>
              <p>Planeje suas refeições e acompanhe sua alimentação</p>
            </div>
            <div className="nutrition-grid">
              {NUTRITION_TIPS.map((nutrition) => (
                <div key={nutrition.id} className="nutrition-card" onClick={() => setSelectedNutrition(selectedNutrition === nutrition.id ? null : nutrition.id)}>
                  <div className="nutrition-emoji">{nutrition.emoji}</div>
                  <h3>{nutrition.title}</h3>
                  <p className="category">{nutrition.category}</p>
                  <p>{nutrition.description}</p>
                  {selectedNutrition === nutrition.id && (
                    <div className="nutrition-details">
                      <div className="meals-logged">
                        <h4>✓ Benefícios</h4>
                        <ul>
                          {nutrition.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                      <div className="meal-input-section">
                        <input type="text" className="meal-input" placeholder="Adicione uma refeição..." value={mealInput} onChange={(e) => setMealInput(e.target.value)} />
                        <button className="add-meal-btn" onClick={() => addMeal(nutrition.id, mealInput)}>➕</button>
                      </div>
                      {userMeals[nutrition.id] && userMeals[nutrition.id].length > 0 && (
                        <div className="meals-logged">
                          <h4>📋 Refeições Registradas</h4>
                          <ul>
                            {userMeals[nutrition.id].map((meal, i) => (
                              <li key={i}>
                                {meal}
                                <button className="remove-meal" onClick={() => removeMeal(nutrition.id, i)}>✕</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="avoid-foods">
                        <h4>❌ Evitar</h4>
                        <ul>
                          {nutrition.avoidFoods.map((food, i) => <li key={i}>{food}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* METAS */}
        {currentPage === 'goals' && (
          <div className="goals-page">
            <div className="page-header">
              <h2>🎯 Metas de Treino</h2>
              <p>Defina e acompanhe seus objetivos fitness</p>
            </div>
            <div className="goals-grid">
              {GOALS.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-emoji">{goal.emoji}</div>
                  <h3>{goal.name}</h3>
                  <p>{goal.description}</p>
                  <button className="select-btn" onClick={() => { setUserGoal(goal.name); addToast(`Meta: ${goal.name} definida!`, 'success', '✅'); }}>
                    Definir Meta
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {currentPage === 'profile' && (
          <div className="profile-page">
            <div className="page-header">
              <h2>👤 Meu Perfil</h2>
              <p>Gerencie suas informações e preferências</p>
            </div>
            <div className="profile-card">
              <div className="profile-info">
                <h3>Nome</h3>
                <input type="text" className="profile-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Seu nome" />
                <button className="save-btn" onClick={saveProfile} disabled={savingProfile}>
                  {savingProfile ? '⏳ Salvando...' : '💾 Salvar Perfil'}
                </button>
              </div>
              <div className="profile-info">
                <h3>E-mail</h3>
                <p className="profile-email">{user?.email}</p>
              </div>
              <div className="profile-info">
                <h3>Plano</h3>
                <p className="profile-plan">{userPlan === 'pro' ? '💎 PRO - Acesso Ilimitado' : '🆓 FREE - 2 treinos por semana'}</p>
                {userPlan === 'free' && (
                  <button className="upgrade-btn" onClick={() => setShowUpgradeModal(true)}>💳 Fazer Upgrade</button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE UPGRADE */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>✕</button>
            <h2>💎 Upgrade para PRO</h2>
            <p>Desbloqueie treinos ilimitados e acesso a todos os recursos premium!</p>
            <div className="upgrade-features">
              <div className="feature">✅ Treinos Ilimitados</div>
              <div className="feature">✅ 100+ Exercícios</div>
              <div className="feature">✅ Cronômetro Avançado</div>
              <div className="feature">✅ Suporte Prioritário</div>
            </div>
            <div className="payment-methods">
              <button className="payment-method-btn pix" onClick={() => { setPixConfirmCode(''); setPixPending(false); }}>
                💳 PIX - R$ 9,99/mês
              </button>
              <button className="payment-method-btn card">
                🏦 Cartão - R$ 9,99/mês
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.icon} {toast.message}</span>
            <button onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
