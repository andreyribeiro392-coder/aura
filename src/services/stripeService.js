import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (você precisa adicionar sua chave pública do Stripe)
let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    // IMPORTANTE: Substitua pela sua chave pública do Stripe
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51234567890';
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};

// Criar sessão de pagamento
export const createPaymentSession = async (userEmail, userId) => {
  try {
    const response = await fetch('/api/create-payment-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        userId: userId,
        priceId: 'price_1234567890', // ID do produto PRO no Stripe
      }),
    });

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    throw error;
  }
};

// Redirecionar para checkout
export const redirectToCheckout = async (sessionId) => {
  const stripe = await getStripe();
  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    console.error('Erro ao redirecionar para checkout:', error);
    throw error;
  }
};

// Processar pagamento com card
export const processCardPayment = async (stripe, elements, userEmail, userId) => {
  try {
    const cardElement = elements.getElement('card');
    
    const { token } = await stripe.createToken(cardElement);
    
    if (token) {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.id,
          email: userEmail,
          userId: userId,
          amount: 799, // R$ 7,99 em centavos
        }),
      });

      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
};
