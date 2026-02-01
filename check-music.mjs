import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkMusic() {
    try {
        const fieldRef = doc(db, 'settings', 'landing_photos', 'fields', 'backgroundMusic');
        const docSnap = await getDoc(fieldRef);

        if (docSnap.exists()) {
            console.log('✅ Music data found in Firestore:');
            console.log(JSON.stringify(docSnap.data(), null, 2));
        } else {
            console.log('❌ No music data found in Firestore');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking music:', error);
        process.exit(1);
    }
}

checkMusic();
