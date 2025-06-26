// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCHERRuX5LTGyusy9GNGXVOiM7HhtccDAg",
  authDomain: "ats-resume-check.firebaseapp.com",
  projectId: "ats-resume-check",
  storageBucket: "ats-resume-check.appspot.com",
  messagingSenderId: "475436674354",
  appId: "1:475436674354:web:b6d070726cf33918a8fb2b",
  measurementId: "G-4LCBDP29H6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 

export { auth };