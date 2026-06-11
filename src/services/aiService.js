import { LIMITS } from "../utils/limits"

let count = 0
let plan = "free"

export function setPlan(p) {
  plan = p
}

export function canUse() {
  return plan === "premium" || count < LIMITS.free
}

export function sendMessage(msg) {
  if (!canUse()) {
    return "Limite free atingido. Faça upgrade para Premium."
  }

  count++

  const replies = [
    "Treino gerado: 3x12 agachamento + 3x10 supino",
    "Dica: aumente proteína para ganhar massa",
    "Cardio recomendado: 20 min caminhada rápida"
  ]

  return replies[Math.floor(Math.random() * replies.length)]
}
