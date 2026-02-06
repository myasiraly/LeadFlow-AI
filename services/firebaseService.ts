import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, Firestore } from 'firebase/firestore';
import { UserProfile, PlanType } from '../types';

/**
 * FIRESTORE SECURITY RULES (REQUIRED):
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{email} {
 *       allow read, write: if request.auth != null && request.auth.token.email == email;
 *     }
 *   }
 * }
 */

const firebaseConfig = {
  apiKey: "AIzaSyA9PjQeDp2IMy6MEB_gyFZ7VfTaOdaVNbo",
  authDomain: "leadgen-ai-f44d5.firebaseapp.com",
  projectId: "leadgen-ai-f44d5",
  storageBucket: "leadgen-ai-f44d5.firebasestorage.app",
  messagingSenderId: "802312999592",
  appId: "1:802312999592:web:236b6eef90f9c2aca1289d"
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export async function getUserProfile(email: string): Promise<UserProfile> {
  const docRef = doc(db, 'users', email);
  let docSnap;
  
  try {
    docSnap = await getDoc(docRef);
  } catch (err: any) {
    console.error("Firebase getDoc Error:", err);
    throw err; // Re-throw to be caught by App.tsx init logic
  }

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
    try {
      await setDoc(docRef, newProfile);
    } catch (err: any) {
      console.error("Firebase setDoc Error:", err);
      throw err;
    }
    return newProfile;
  }
}

export async function incrementSearchCount(email: string, leadsFound: number) {
  const docRef = doc(db, 'users', email);
  try {
    await updateDoc(docRef, {
      searchesToday: increment(1),
      totalLeadsExtracted: increment(leadsFound)
    });
  } catch (err: any) {
    console.error("Firebase updateDoc Error:", err);
    throw err;
  }
}

export async function upgradeToPro(email: string) {
  const docRef = doc(db, 'users', email);
  await updateDoc(docRef, { 
    plan: PlanType.PRO,
    subscriptionActive: true
  });
}