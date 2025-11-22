import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLMNvYJcfNiYbFzMpfmcrAAst8EVhZfEI",
  authDomain: "ozera-eg.firebaseapp.com",
  projectId: "ozera-eg",
  storageBucket: "ozera-eg.firebasestorage.app",
  messagingSenderId: "50265366064",
  appId: "1:50265366064:web:2511e7802a07779b6957f5",
  measurementId: "G-K7W98RBMWL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
