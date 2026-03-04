import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2AREw5zCcXaARmu9xflxuwDQ2kjB10vY",
  authDomain: "octa-hr-portal.firebaseapp.com",
  projectId: "octa-hr-portal",
  storageBucket: "octa-hr-portal.firebasestorage.app",
  messagingSenderId: "605426786233",
  appId: "1:605426786233:web:6d1f699cb94885bf06e068"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
