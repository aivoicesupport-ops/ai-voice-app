import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrT7SRc9HB5z4ljltdD1x-QfmxNU-4zmw",
  authDomain: "ai-voice-app-85078.firebaseapp.com",
  projectId: "ai-voice-app-85078",
  storageBucket: "ai-voice-app-85078.firebasestorage.app",
  messagingSenderId: "475166368584",
  appId: "1:475166368584:web:5671f6bd5cf9161f96c97d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);