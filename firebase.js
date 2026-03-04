import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyA2AREw5zCcXaARmu9xflxuwDQ2kjB10vY",
  authDomain: "octa-hr-portal.firebaseapp.com",
  projectId: "octa-hr-portal",
  storageBucket: "octa-hr-portal.firebasestorage.app",
  messagingSenderId: "605426786233",
  appId: "1:605426786233:web:6d1f699cb94885bf06e068",
  databaseURL:"https://octa-hr-portal-default-rtdb.firebaseio.com",
};

export const app = initializeApp(firebaseConfig)