import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAw_BKXuQp-MpEUXtQxPS0kTUBRWRJdKJg",
    authDomain: "typing-test-pro-732d1.firebaseapp.com",
    projectId: "typing-test-pro-732d1",
    storageBucket: "typing-test-pro-732d1.firebasestorage.app",
    messagingSenderId: "768310732732",
    appId: "1:768310732732:web:254f5205d4ae4cf75aedb9",
    measurementId: "G-93808KLYVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
