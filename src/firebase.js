import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyBF6UVLLh_QA96sfcThSORKuNPafb5oVzI",
  authDomain: "mediadiet-5e740.firebaseapp.com",
  projectId: "mediadiet-5e740",
  storageBucket: "mediadiet-5e740.firebasestorage.app",
  messagingSenderId: "898738968482",
  appId: "1:898738968482:web:31178a23f6b609a97b44fb",
  measurementId: "G-4MWZNMTS5B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);