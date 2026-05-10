import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ",
  authDomain: "kadai-veedhi.firebaseapp.com",
  projectId: "kadai-veedhi",
  storageBucket: "kadai-veedhi.firebasestorage.app",
  messagingSenderId: "380682132082",
  appId: "1:380682132082:web:d5892b06926e75e70940eb",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
setPersistence(auth, getReactNativePersistence(AsyncStorage));
export const db = getFirestore(app);
export default app;
