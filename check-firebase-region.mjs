import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAi2CbAp5-FvhVZ0FT5pVL4vXc5q4xK-W0",
    authDomain: "charged-satellite-zimpad.firebaseapp.com",
    projectId: "charged-satellite-zimpad",
    storageBucket: "charged-satellite-zimpad.firebasestorage.app",
    messagingSenderId: "410941736916",
    appId: "1:410941736916:web:c1727d34a3ef71c3a93841"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('='.repeat(60));
console.log('FIREBASE CONFIGURATION CHECK');
console.log('='.repeat(60));
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Storage Bucket:', firebaseConfig.storageBucket);
console.log('='.repeat(60));
console.log('\n⚠️  To check your Firestore and Storage regions:');
console.log('1. Visit: https://console.firebase.google.com/project/charged-satellite-zimpad/firestore');
console.log('2. Visit: https://console.firebase.google.com/project/charged-satellite-zimpad/storage');
console.log('\nLook for the location/region displayed at the top!');
console.log('='.repeat(60));

process.exit(0);
