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
      <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663735503721/FGPWCmlJmoEbhcmZ.mp4" type="video/mp4" />
    </video>
    <div className="video-overlay"></div>
  </div>
);

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
];

// ============================================================
// DADOS DE NUTRIÇÃO (CONVERTIDO DE MEALS)
// ============================================================
const NUTRITION_TIPS = [
  { id: 1, name: 'Café da manhã', category: 'Primeira refeição', image: '🥚', calories: 350, protein: 15, carbs: 35, avoidFoods: ['Açúcar refinado', 'Frituras', 'Sucos artificiais'] },
  { id: 2, name: 'Lanche da manhã', category: 'Intermediária', image: '🍌', calories: 250, protein: 10, carbs: 30, avoidFoods: ['Biscoitos recheados', 'Salgadinhos'] },
  { id: 3, name: 'Almoço', category: 'Principal', image: '🍗', calories: 550, protein: 45, carbs: 60, avoidFoods: ['Refrigerantes', 'Sobremesas pesadas'] },
  { id: 4, name: 'Lanche da tarde', category: 'Intermediária', image: '🥤', calories: 200, protein: 22, carbs: 20, avoidFoods: ['Doces', 'Pães brancos em excesso'] },
  { id: 5, name: 'Jantar', category: 'Principal', image: '🍳', calories: 380, protein: 28, carbs: 15, avoidFoods: ['Comidas muito pesadas', 'Cafeína'] },
  { id: 6, name: 'Ceia', category: 'Última refeição', image: '🥛', calories: 150, protein: 12, carbs: 18, avoidFoods: ['Açúcar', 'Alimentos estimulantes'] },
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
// DICAS EDUCACIONAIS
// ============================================================
const EDUCATION_TIPS = [
  { id: 1, emoji: '⚠️', title: 'Não Pule o Aquecimento', description: 'O aquecimento prepara músculos, tendões e articulações para o esforço. Pular essa etapa aumenta drasticamente o risco de lesões.', tips: ['5-10 min de aquecimento geral', 'Mobilidade articular específica', 'Séries de aquecimento com peso leve', 'Nunca vá direto para o peso máximo'] },
  { id: 2, emoji: '🏋️', title: 'Técnica Antes do Peso', description: 'Executar exercícios com técnica incorreta é a principal causa de lesões na academia. Aprenda o movimento correto antes de aumentar a carga.', tips: ['Comece com peso leve para aprender', 'Grave-se para analisar a técnica', 'Peça orientação a um profissional', 'Amplitude completa de movimento'] },
  { id: 3, emoji: '😴', title: 'Respeite o Descanso', description: 'O músculo cresce durante o descanso, não durante o treino. Treinar sem recuperação adequada leva ao overtraining e regressão nos resultados.', tips: ['48h de descanso por grupo muscular', 'Sono de 7-9 horas por noite', 'Semana de deload a cada 4-6 semanas', 'Ouça os sinais do seu corpo'] },
  { id: 4, emoji: '💧', title: 'Hidratação é Fundamental', description: 'Desidratação de apenas 2% já prejudica a performance. Beba água antes, durante e após o treino para manter o rendimento e a saúde.', tips: ['2-3L de água por dia', 'Beba 500ml antes do treino', 'Reponha durante o exercício', 'Isotônicos em treinos longos'] },
  { id: 5, emoji: '🍎', title: 'Nutrição Pós-Treino', description: 'A janela anabólica pós-treino é real. Consuma proteínas e carboidratos em até 2 horas após o exercício para maximizar a recuperação muscular.', tips: ['Proteína: 20-40g pós-treino', 'Carboidratos para repor glicogênio', 'Whey protein de absorção rápida', 'Refeição completa em até 2h'] },
  { id: 6, emoji: '📈', title: 'Progressão de Carga', description: 'Para continuar evoluindo, você precisa aumentar progressivamente o estímulo. Fazer sempre o mesmo treino com o mesmo peso leva à estagnação.', tips: ['Aumente 2.5-5% de carga por semana', 'Varie repetições e séries', 'Periodize o treino a cada 4-8 semanas', 'Registre seus treinos para acompanhar'] },
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

        {/* DASHBOARD */}
        {currentPage === 'dashboard' && (
          <div className="dashboard-page">

            {/* CENA DO CARRO ESPORTIVO EM MOVIMENTO */}
            <div className="car-scene-container" style={{
              width: '100%',
              height: '150px',
              background: 'linear-gradient(to bottom, #1a1a1a, #000)',
              borderRadius: 'var(--radius)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '1px solid var(--border)'
            }}>
              <div className="road" style={{
                position: 'absolute',
                bottom: '20px',
                width: '200%',
                height: '2px',
                background: 'dashed linear-gradient(90deg, #fff 50%, transparent 50%)',
                backgroundSize: '40px 2px',
                animation: 'roadScroll 0.5s linear infinite'
              }}></div>
              <div className="sport-car" style={{
                position: 'absolute',
                bottom: '15px',
                left: '50px',
                fontSize: '3rem',
                animation: 'carVibrate 0.1s infinite alternate'
              }}>
                🏎️💨
              </div>
              <div className="scene-text" style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                textAlign: 'right'
              }}>
                <h3 style={{ color: '#fff', margin: 0 }}>AuraFit Speed</h3>
                <p style={{ color: 'var(--primary)', margin: 0, fontSize: '0.8rem' }}>Sua evolução não para</p>
              </div>
              <style>{`
                @keyframes roadScroll {
                  from { transform: translateX(0); }
                  to { transform: translateX(-40px); }
                }
                @keyframes carVibrate {
                  from { transform: translateY(0); }
                  to { transform: translateY(-2px); }
                }
              `}</style>
            </div>
            <div className="dashboard-header-premium">
              <div className="time-date-display">
                <div className="current-time">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div className="current-date">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              </div>
              <div className="welcome-section">
                <h2>AuraFit</h2>
              </div>
            </div>
            <div className="stats-container">
              <div className="stat-card"><h3>Treinos Concluídos</h3><p className="stat-number">{completedWorkoutsCount}</p></div>
              <div className="stat-card"><h3>Plano Atual</h3><p className="stat-number">{userPlan === 'pro' ? 'PRO ∞' : 'FREE (2)'}</p></div>
              <div className="stat-card"><h3>Meta Atual</h3><p className="stat-number" style={{ fontSize: '1rem', paddingTop: '4px' }}>{userGoal || 'Não definida'}</p></div>
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
                  <p>Exercícios sem equipamento</p>
                </div>
              </div>
              <div className="modern-card gym-workout-card" onClick={() => setCurrentPage('gym-workouts')}>
                <div className="card-overlay"></div>
                <div className="card-content">
                  <div className="card-icon">🏋️</div>
                  <h3>Academia</h3>
                  <p>Treinos com equipamentos</p>
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
            {user.email === 'andreybribeiro392@gmail.com' && (
              <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="admin-btn">⚙️ {showAdminPanel ? 'Fechar Painel Admin' : 'Painel Admin'}</button>
            )}
            {showAdminPanel && user.email === 'andreybribeiro392@gmail.com' && (
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

        {/* NUTRIÇÃO */}
        {currentPage === 'nutrition' && (
          <div className="nutrition-page">
            <div className="page-header"><h2>🍎 Nutrição</h2><p>Registre suas refeições e veja o que não deve comer</p></div>
            <div className="nutrition-grid">
              {NUTRITION_TIPS.map((nutrition) => (
                <div key={nutrition.id} className="nutrition-card" onClick={() => setSelectedNutrition(selectedNutrition === nutrition.id ? null : nutrition.id)}>
                  <div className="nutrition-emoji">{nutrition.image}</div>
                  <h3>{nutrition.name}</h3>
                  <p className="category">{nutrition.category}</p>
                  <div className="nutrition-macros">
                    <span>🔥 {nutrition.calories}kcal</span>
                    <span>💪 {nutrition.protein}g</span>
                    <span>🌾 {nutrition.carbs}g</span>
                  </div>
                  {selectedNutrition === nutrition.id && (
                    <div className="nutrition-details">
                      <div className="meal-input-section">
                        <input 
                          type="text" 
                          placeholder="Registre que comeu..." 
                          value={mealInput} 
                          onChange={(e) => setMealInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addMeal(nutrition.id, mealInput)}
                          className="meal-input"
                        />
                        <button onClick={() => addMeal(nutrition.id, mealInput)} className="add-meal-btn">➕</button>
                      </div>
                      {userMeals[nutrition.id] && userMeals[nutrition.id].length > 0 && (
                        <div className="meals-logged">
                          <h4>✅ Refeições Registradas:</h4>
                          <ul>
                            {userMeals[nutrition.id].map((meal, idx) => (
                              <li key={idx}>
                                {meal}
                                <button onClick={() => removeMeal(nutrition.id, idx)} className="remove-meal">✕</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="avoid-foods">
                        <h4>⛔ Evite Comer:</h4>
                        <ul>
                          {nutrition.avoidFoods && nutrition.avoidFoods.map((food, idx) => (
                            <li key={idx}>{food}</li>
                          ))}
                        </ul>
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
                    </>
                  )}
                  {expandedEducation !== tip.id && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4 }}>Clique para expandir →</p>}
                </div>
              ))}
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
      {showAdminPaymentPanel && user.email === 'andreybribeiro392@gmail.com' && (
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
