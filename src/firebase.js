// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLx-H2RQW9Gn0vRZ3vZ4xMSADUTCALYOA",
  authDomain: "react-jobs-789dd.firebaseapp.com",
  projectId: "react-jobs-789dd",
  storageBucket: "react-jobs-789dd.firebasestorage.app",
  messagingSenderId: "790606858599",
  appId: "1:790606858599:web:62c2348e979b1905be47c2",
  measurementId: "G-Q0RDZ1YVRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;