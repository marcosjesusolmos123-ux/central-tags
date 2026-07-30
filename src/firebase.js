import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDHHKyjxLK8OG4JDgq0wOtrddHEQMRRU3E",
  authDomain: "central-tags.firebaseapp.com",
  projectId: "central-tags",
  storageBucket: "central-tags.firebasestorage.app",
  messagingSenderId: "970205162595",
  appId: "1:970205162595:web:55c9607b59b81d61bddc56"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;