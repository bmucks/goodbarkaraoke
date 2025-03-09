// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbrZN0LBrzxAQL5_C00WMjHTR7gpbnLJ0",
  authDomain: "pbacgolf.firebaseapp.com",
  databaseURL: "https://pbacgolf-default-rtdb.firebaseio.com",
  projectId: "pbacgolf",
  storageBucket: "pbacgolf.firebasestorage.app",
  messagingSenderId: "162822604844",
  appId: "1:162822604844:web:505e93c13cd2993c162989"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };