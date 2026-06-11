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
    benefits: ['FortAlece peito e tríceps', 'Melhora postura', 'Sem equipamento necessário'],
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

const GOALS = [
  { id: 1, emoji: '🔥', name: 'Perder Peso', description: 'Reduza o percentual de gordura corporal com treinos e alimentação adequada.', tips: ['Déficit calórico de 300-500 kcal/dia', 'Priorize proteínas (2g/kg)', 'Cardio 3-4x por semana', 'Treino de força preserva músculo'] },
  { id: 2, emoji: '💪', name: 'Ganhar Massa', description: 'Aumente a massa muscular com treinos progressivos e superávit calórico.', tips: ['Superávit calórico de 200-400 kcal/dia', 'Proteína: 2-2.5g/kg de peso', 'Treino de força 4-5x por semana', 'Sono de qualidade 7-9h'] },
  { id: 3, emoji: '🏃', name: 'Melhorar Condicionamento', description: 'Aumente sua resistência cardiovascular e capacidade aeróbica.', tips: ['Cardio progressivo 3-5x/semana', 'Varie intensidade (HIIT + steady state)', 'Hidratação adequada', 'Recuperação entre sessões'] },
  { id: 4, emoji: '🧘', name: 'Flexibilidade', description: 'Melhore a mobilidade articular e reduza tensões musculares.', tips: ['Alongamento diário 15-20 min', 'Yoga ou pilates 2-3x/semana', 'Aquecimento antes dos treinos', 'Massagem e foam roller'] },
  { id: 5, emoji: '🏆', name: 'Performance', description: 'Maximize sua performance atlética para competições ou desafios pessoais.', tips: ['Periodização do treino', 'Nutrição esportiva específica', 'Recuperação ativa', 'Monitoramento de métricas'] },
  { id: 6, emoji: '❤️', name: 'Saúde Geral', description: 'Mantenha-se saudável, ativo e com qualidade de vida elevada.', tips: ['Exercício regular 3-4x/semana', 'Alimentação equilibrada', 'Gestão do estresse', 'Check-ups médicos regulares'] },
];

const EDUCATION_TIPS = [
  { id: 1, emoji: '⚠️', title: 'Não Pule o Aquecimento', description: 'O aquecimento prepara músculos, tendões e articulações para o esforço. Pular essa etapa aumenta drasticamente o risco de lesões.', tips: ['5-10 min de aquecimento geral', 'Mobilidade articular específica', 'Séries de aquecimento com peso leve', 'Nunca vá direto para o peso máximo'] },
  { id: 2, emoji: '🏋️', title: 'Técnica Antes do Peso', description: 'Executar exercícios com técnica incorreta é a principal causa de lesões na academia. Aprenda o movimento correto antes de aumentar a carga.', tips: ['Comece com peso leve para aprender', 'Grave-se para analisar a técnica', 'Peça orientação a um profissional', 'Amplitude completa de movimento'] },
  { id: 3, emoji: '😴', title: 'Respeite o Descanso', description: 'O músculo cresce durante o descanso, não durante o treino. Treinar sem recuperação adequada leva ao overtraining e regressão nos resultados.', tips: ['48h de descanso por grupo muscular', 'Sono de 7-9 horas por noite', 'Semana de deload a cada 4-6 semanas', 'Ouça os sinais do seu corpo'] },
  { id: 4, emoji: '💧', title: 'Hidratação é Fundamental', description: 'Desidratação de apenas 2% já prejudica a performance. Beba água antes, durante e após o treino para manter o rendimento e a saúde.', tips: ['2-3L de água por dia', 'Beba 500ml antes do treino', 'Reponha durante o exercício', 'Isotônicos em treinos longos'] },
  { id: 5, emoji: '🍎', title: 'Nutrição Pós-Treino', description: 'A janela anabólica pós-treino é real. Consuma proteínas e carboidratos em até 2 horas após o exercício para maximizar a recuperação muscular.', tips: ['Proteína: 20-40g pós-treino', 'Carboidratos para repor glicogênio', 'Whey protein de absorção rápida', 'Refeição completa em até 2h'] },
  { id: 6, emoji: '📈', title: 'Progressão de Carga', description: 'Para continuar evoluindo, você precisa aumentar progressivamente o estímulo. Fazer sempre o mesmo treino com o mesmo peso leva à estagnação.', tips: ['Aumente 2.5-5% de carga por semana', 'Varie repetições e séries', 'Periodize o treino a cada 4-8 semanas', 'Registre seus treinos para acompanhar'] },
];

const NUTRITION_TIPS = [
  { id: 1, name: 'Dieta Equilibrada', category: 'Geral', image: '🥗', calories: 2000, protein: 150, carbs: 200, avoidFoods: ['Açúcar refinado', 'Frituras', 'Refrigerantes'] },
  { id: 2, name: 'Ganho de Massa', category: 'Bulking', image: '🥩', calories: 3000, protein: 200, carbs: 400, avoidFoods: ['Fast food', 'Álcool'] },
];

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
    return saved !== null ? saved === 'true' : true;
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
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [pixConfirmCode, setPixConfirmCode] = useState('');
  const [pixPending, setPixPending] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
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
      await setDoc(paymentRef, {
        userId: user.uid, email: user.email, amount: 9.99, method: 'pix',
        confirmCode: pixConfirmCode.trim(), status: 'pending', requestedAt: serverTimestamp(),
      });
      setPixPending(true);
      addToast('Pagamento em análise. Aguarde a confirmação.', 'warning', '⏳');
    } catch (e) { addToast('Erro ao verificar pagamento', 'error', '❌'); }
    finally { setProcessingPayment(false); }
  }

  async function handleCardPayment() {
    if (!cardName || !cardNumber || !cardExpiry || !cardCVC) { addToast('Preencha todos os dados do cartão', 'error', '❌'); return; }
    setProcessingPayment(true);
    try {
      const paymentRef = doc(db, 'payments', user.uid);
      await setDoc(paymentRef, {
        userId: user.uid, email: user.email, amount: 9.99, method: 'card',
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4), status: 'pending', requestedAt: serverTimestamp(),
      });
      addToast('Pagamento em análise. Aguarde a confirmação.', 'warning', '⏳');
      setShowUpgradeModal(false);
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

  const filteredHomeWorkouts = homeWorkoutFilter === 'Todos' ? HOME_WORKOUTS : HOME_WORKOUTS.filter((w) => w.level === homeWorkoutFilter);
  const filteredGymWorkouts = gymWorkoutFilter === 'Todos' ? GYM_WORKOUTS : GYM_WORKOUTS.filter((w) => w.category === gymWorkoutFilter);
  const gymCategories = ['Todos', ...new Set(GYM_WORKOUTS.map((w) => w.category))];

  if (loading) return <div className="loading">⚡ AuraFit Carregando...</div>;

  if (!user) {
    return (
      <div className={`auth-container ${darkMode ? 'dark' : ''}`}>
        <div className="auth-box">
          <h1>AuraFit</h1>
          <p>Seu app de treinos premium</p>
          <div className="auth-tabs" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button className={`nav-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Entrar</button>
            <button className={`nav-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Criar Conta</button>
          </div>
          {authError && <div className="toast toast-error" style={{ marginBottom: 10 }}>⚠️ {authError}</div>}
          <form className="auth-form" onSubmit={handleAuth}>
            <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="primary-btn" disabled={authLoading}>
              {authLoading ? '⏳ Aguarde...' : isLogin ? '🚀 Entrar' : '✨ Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <h1>Aura<span>Fit</span></h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setDarkMode(!darkMode)} className="badge">{darkMode ? '☀️' : '🌙'}</button>
            <div className="pro-menu-container">
              <button onClick={() => setShowProMenu(!showProMenu)} className={`badge ${userPlan === 'pro' ? 'badge-muscle' : ''}`}>
                {userPlan === 'pro' ? '💎 PRO' : '🆓 FREE'}
              </button>
              {showProMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, zIndex: 100 }}>
                  {userPlan === 'pro' ? (
                    <button onClick={() => { setShowAdminPaymentPanel(true); setShowProMenu(false); }} className="nav-btn">💳 Pagamento</button>
                  ) : (
                    <button onClick={() => { setShowUpgradeModal(true); setShowProMenu(false); }} className="nav-btn">💎 Upgrade</button>
                  )}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="badge">🚪</button>
          </div>
        </div>
      </header>

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
      </nav>

      <main className="main-content">
        {currentPage === 'dashboard' && (
          <div className="dashboard-page">
            <div className="dashboard-header-premium">
              <div>
                <h2>Bem-vindo ao AuraFit</h2>
                <p className="current-date">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="current-time">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="stats-container">
              <div className="stat-card"><h3>Treinos Concluídos</h3><p className="stat-number">{completedWorkoutsCount}</p></div>
              <div className="stat-card"><h3>Plano Atual</h3><p className="stat-number">{userPlan.toUpperCase()}</p></div>
              <div className="stat-card"><h3>Meta</h3><p className="stat-number" style={{ fontSize: '1.2rem' }}>{userGoal || 'Definir'}</p></div>
            </div>
            <div className="workouts-grid">
              {GOALS.slice(0, 3).map(goal => (
                <div key={goal.id} className="goal-card" onClick={() => setCurrentPage('goals')}>
                  <div style={{ fontSize: '2rem' }}>{goal.emoji}</div>
                  <h3>{goal.name}</h3>
                  <p>{goal.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'home-workouts' && (
          <div className="workouts-page">
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map(f => (
                <button key={f} className={`badge ${homeWorkoutFilter === f ? 'badge-muscle' : ''}`} onClick={() => setHomeWorkoutFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="workouts-grid">
              {filteredHomeWorkouts.map(w => (
                <div key={w.id} className="workout-card">
                  <div style={{ fontSize: '2rem' }}>{w.image}</div>
                  <h3>{w.name}</h3>
                  <div style={{ display: 'flex', gap: 8 }}><span className="badge">{w.level}</span><span className="badge">{w.duration}</span></div>
                  <p>{w.description}</p>
                  <button className="primary-btn" onClick={() => { if (canStartWorkout()) setSelectedWorkout(w); }}>Começar Treino</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'gym-workouts' && (
          <div className="gym-workouts-page">
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 10 }}>
              {gymCategories.map(c => (
                <button key={c} className={`badge ${gymWorkoutFilter === c ? 'badge-muscle' : ''}`} onClick={() => setGymWorkoutFilter(c)}>{c}</button>
              ))}
            </div>
            <div className="gym-workouts-grid">
              {filteredGymWorkouts.map(w => (
                <div key={w.id} className="gym-workout-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>{w.image}</div>
                    <span className="badge badge-muscle">{w.category}</span>
                  </div>
                  <h3>{w.name}</h3>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>🔄 {w.sets} séries</span>
                    <span>🔢 {w.reps} reps</span>
                    <span>⏱️ {w.rest} desc.</span>
                  </div>
                  <p style={{ fontSize: '0.9rem' }}>{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'nutrition' && (
          <div className="nutrition-page">
            <div className="nutrition-grid">
              {MEALS.map(meal => (
                <div key={meal.id} className="meal-card">
                  <div style={{ fontSize: '2rem' }}>{meal.image}</div>
                  <h3>{meal.name}</h3>
                  <p className="badge">{meal.category}</p>
                  <p>🔥 {meal.calories} kcal | 💪 {meal.protein}g P</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{meal.ingredients.join(', ')}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 40 }}>
              <h3>Dicas de Nutrição</h3>
              <div className="nutrition-grid" style={{ marginTop: 20 }}>
                {NUTRITION_TIPS.map(tip => (
                  <div key={tip.id} className="goal-card">
                    <div style={{ fontSize: '2rem' }}>{tip.image}</div>
                    <h3>{tip.name}</h3>
                    <p><strong>Evitar:</strong> {tip.avoidFoods.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'goals' && (
          <div className="goals-page">
            <div className="goals-grid">
              {GOALS.map(goal => (
                <div key={goal.id} className="goal-card">
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{goal.emoji}</div>
                  <h3 style={{ marginBottom: 8 }}>{goal.name}</h3>
                  <p style={{ marginBottom: 16 }}>{goal.description}</p>
                  <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 8 }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 8 }}>Dicas Pro:</h4>
                    <ul style={{ paddingLeft: 16, fontSize: '0.85rem' }}>
                      {goal.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'store' && (
          <div className="store-page">
            {user.email === 'andreybribeiro392@gmail.com' && (
              <div className="stat-card" style={{ marginBottom: 24 }}>
                <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="primary-btn">⚙️ Gerenciar Loja</button>
                {showAdminPanel && (
                  <div className="auth-form" style={{ marginTop: 16 }}>
                    <input type="text" placeholder="Nome" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                    <input type="number" placeholder="Preço" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <button onClick={handleSaveProduct} className="primary-btn">Salvar Produto</button>
                  </div>
                )}
              </div>
            )}
            <div className="products-grid">
              {storeProducts.map(p => (
                <div key={p.id} className="product-card">
                  <div style={{ fontSize: '3rem', textAlign: 'center' }}>{p.image}</div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <p className="stat-number" style={{ fontSize: '1.5rem' }}>R$ {p.price}</p>
                  <a href={p.link} target="_blank" rel="noreferrer" className="primary-btn">Comprar</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'education' && (
          <div className="education-page">
            <div className="workouts-grid">
              {EDUCATION_TIPS.map(tip => (
                <div key={tip.id} className="education-card">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '2rem' }}>{tip.emoji}</div>
                    <h3>{tip.title}</h3>
                  </div>
                  <p style={{ marginBottom: 16 }}>{tip.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tip.tips.map((t, i) => <span key={i} className="badge">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'profile' && (
          <div className="modal" style={{ maxWidth: '100%' }}>
            <h2>Meu Perfil</h2>
            <div className="auth-form">
              <label>Nome</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              <button onClick={saveProfile} className="primary-btn" disabled={savingProfile}>Salvar</button>
            </div>
            <div style={{ marginTop: 20 }}>
              <p>E-mail: {user.email}</p>
              <p>Plano: {userPlan.toUpperCase()}</p>
            </div>
          </div>
        )}
      </main>

      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowUpgradeModal(false)}>×</button>
            <h2>💎 Upgrade para PRO</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '20px 0' }}>
              <div className="stat-card"><h4>FREE</h4><p>2 treinos/mês</p></div>
              <div className="stat-card" style={{ borderColor: 'var(--primary)' }}><h4>PRO</h4><p>Ilimitado</p></div>
            </div>
            <div className="auth-form">
              <p>Pague R$ 9,99 via PIX ou Cartão</p>
              <div style={{ textAlign: 'center' }}>
                <QRCodeSVG value={PIX_PAYLOAD} size={150} />
              </div>
              <input type="text" placeholder="Cód. Confirmação" value={pixConfirmCode} onChange={e => setPixConfirmCode(e.target.value)} />
              <button onClick={handlePixConfirm} className="primary-btn">Confirmar Pagamento</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
