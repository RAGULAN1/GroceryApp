import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ",
  authDomain: "kadai-veedhi.firebaseapp.com",
  projectId: "kadai-veedhi",
  storageBucket: "kadai-veedhi.firebasestorage.app",
  messagingSenderId: "380682132082",
  appId: "1:380682132082:web:d5892b06926e75e70940eb",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
