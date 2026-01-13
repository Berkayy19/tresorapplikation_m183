import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// HIER DEINE DATEN AUS DER FIREBASE CONSOLE EINFÜGEN!
const firebaseConfig = {
    apiKey: "AIzaSyDpyX8-oJ-r2ccIl8ZhWAhOu4ht2VuuoW4",

    authDomain: "aufgabentracker-bad39.firebaseapp.com",

    projectId: "aufgabentracker-bad39",

    storageBucket: "aufgabentracker-bad39.firebasestorage.app",

    messagingSenderId: "1065252888684",

    appId: "1:1065252888684:web:c6a5a894d3e0c8b7243849",

    measurementId: "G-9GTH8VSQ75"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();