import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, Firestore } from 'firebase/firestore';
import { UserProfile, PlanType } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyA9PjQeDp2IMy6MEB_gyFZ7VfTaOdaVNbo",
  authDomain: "leadgen-ai-f44d5.firebaseapp.com",
  projectId: "leadgen-ai-f44d5",
  storageBucket: "leadgen-ai-f44d5.firebasestorage.app",
  messagingSenderId: "802312999592",
  appId: "1:802312999592:web:236b6eef90f9c2aca1289d"
};

// Singleton initialization
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export services initialized with the current app instance
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export async function getUserProfile(email: string): Promise<UserProfile> {
  const docRef = doc(db, 'users', email);
  const docSnap = await getDoc(docRef);

  const today = new Date().toISOString().split('T')[0];

  if (docSnap.exists()) {
    const data = docSnap.data() as UserProfile;
    if (data.lastSearchDate !== today) {
      await updateDoc(docRef, { searchesToday: 0, lastSearchDate: today });
      return { ...data, searchesToday: 0, lastSearchDate: today };
    }
    return data;
  } else {
    const newProfile: UserProfile = {
      email,
      plan: PlanType.FREE,
      searchesToday: 0,
      lastSearchDate: today,
      totalLeadsExtracted: 0,
      subscriptionActive: false
    };
    await setDoc(docRef, newProfile);
    return newProfile;
  }
}

export async function incrementSearchCount(email: string, leadsFound: number) {
  const docRef = doc(db, 'users', email);
  await updateDoc(docRef, {
    searchesToday: increment(1),
    totalLeadsExtracted: increment(leadsFound)
  });
}

export async function upgradeToPro(email: string) {
  const docRef = doc(db, 'users', email);
  await updateDoc(docRef, { 
    plan: PlanType.PRO,
    subscriptionActive: true
  });
}