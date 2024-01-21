import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-project-23563.firebaseapp.com",
  projectId: "mern-blog-project-23563",
  storageBucket: "mern-blog-project-23563.appspot.com",
  messagingSenderId: "611823029106",
  appId: "1:611823029106:web:b5f8a826ac87d9d9eb6beb"
};


export const app = initializeApp(firebaseConfig);