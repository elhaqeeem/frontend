// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAB_KS2u28dRKqMGNw9yfzWP4M9j7XE76s",
  authDomain: "lmsin-2206b.firebaseapp.com",
  projectId: "lmsin-2206b",
  storageBucket: "lmsin-2206b.firebasestorage.app",
  messagingSenderId: "688959110964",
  appId: "1:688959110964:web:f757339e09ff38fd756f61",
  measurementId: "G-27EHVD6X5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);