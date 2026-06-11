import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração oficial do seu novo projeto do zero
const firebaseConfig = {
  apiKey: "AIzaSyDeULLbnyAobqeogNhQpznM0kCzYIBu5ns",
  authDomain: "cybergym-fbba9.firebaseapp.com",
  projectId: "cybergym-fbba9",
  storageBucket: "cybergym-fbba9.firebasestorage.app",
  messagingSenderId: "350741243692",
  appId: "1:350741243692:web:b0cf934b3903eec1ccae89"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para o seu app usar
export const auth = getAuth(app);
export const db = getFirestore(app);