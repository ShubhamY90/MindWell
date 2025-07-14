import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
  } from 'firebase/auth';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};
export const signInWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};
export const createUserWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

//export { auth, db };
export default app;