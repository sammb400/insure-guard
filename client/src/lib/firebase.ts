import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN-vhgUHIkkwrKz_Qg9TiRDv3mSI68cSI",
  authDomain: "insureguard-665a0.firebaseapp.com",
  projectId: "insureguard-665a0",
  storageBucket: "insureguard-665a0.firebasestorage.app",
  messagingSenderId: "774336214988",
  appId: "1:774336214988:web:1c0171b6dcfae5aa8b8f69",
  measurementId: "G-CHWV9GZLTB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  console.error("Failed to enable persistence:", err);
});

const analytics = getAnalytics(app);