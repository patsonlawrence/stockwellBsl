import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDeIN9fdcmTCbMSq-1y2BsVHO1BokbETgc",
  authDomain: "stockwellbsl.firebaseapp.com",
  projectId: "stockwellbsl",
  storageBucket: "stockwellbsl.firebasestorage.app",
  messagingSenderId: "154274776156",
  appId: "1:154274776156:web:00219df37ebaf86e9c9299",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
