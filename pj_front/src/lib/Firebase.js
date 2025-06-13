// lib/firebase.js
import { initializeApp } from "firebase/app";
const firebaseConfig = {

    apiKey: "AIzaSyB9oaANcvJvgUTiDjR3zn54xW8qJiK_WgY",

    authDomain: "pj-arcade-1e3be.firebaseapp.com",

    projectId: "pj-arcade-1e3be",

    storageBucket: "pj-arcade-1e3be.firebasestorage.app",

    messagingSenderId: "868783423328",

    appId: "1:868783423328:web:b6ecc18f3602bc0577e805",

    measurementId: "G-4VXD40N8DF"

};

export const app = initializeApp(firebaseConfig);
