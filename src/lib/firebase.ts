
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// NEW Firebase Config - Charged Satellite (India)
// Project: charged-satellite
const firebaseConfig = {
    apiKey: "AIzaSyAF6VUY2BhcJTACuoGKl7Q7trZGMm5UYF0",
    authDomain: "charged-satellite.firebaseapp.com",
    projectId: "charged-satellite",
    storageBucket: "charged-satellite.firebasestorage.app",
    messagingSenderId: "532982159192",
    appId: "1:532982159192:web:bd82889beb87177df8f72d",
    measurementId: "G-MEASUREMENT_ID" // Optional, will be added if you enabled Analytics
};

import { getStorage } from "firebase/storage";

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
import { getAuth } from "firebase/auth";
const auth = getAuth(app);

export { db, storage, auth };
