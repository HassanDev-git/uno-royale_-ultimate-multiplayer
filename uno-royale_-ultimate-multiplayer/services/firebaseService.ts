
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  update, 
  onDisconnect, 
  push, 
  remove, 
  serverTimestamp 
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD2JCmR2enlGxzU5yZiP1nwa8mtv9F6_lU",
  authDomain: "uno-royale-ultimate.firebaseapp.com",
  databaseURL: "https://uno-royale-ultimate-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uno-royale-ultimate",
  storageBucket: "uno-royale-ultimate.firebasestorage.app",
  messagingSenderId: "17654956963",
  appId: "1:17654956963:web:10953ac27e29469de8d016"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  ref, 
  set, 
  get, 
  onValue, 
  update, 
  onDisconnect, 
  push, 
  remove, 
  serverTimestamp 
};
