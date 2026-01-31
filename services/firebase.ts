import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9PjQeDp2IMy6MEB_gyFZ7VfTaOdaVNbo",
  authDomain: "leadgen-ai-f44d5.firebaseapp.com",
  projectId: "leadgen-ai-f44d5",
  storageBucket: "leadgen-ai-f44d5.firebasestorage.app",
  messagingSenderId: "802312999592",
  appId: "1:802312999592:web:236b6eef90f9c2aca1289d"
};

// Singleton initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Auth services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;