import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

async function fixMusic() {
    try {
        // Set a working sample music URL
        const musicData = {
            home: 'https://archive.org/download/TibetanSingingBowlMeditation7Minutes/TibetanSingingBowlMeditation7Minutes.mp3',
            menu: '',
            story: '',
            location: '',
            winter: ''
        };

        const fieldRef = doc(db, 'settings', 'landing_photos', 'fields', 'backgroundMusic');
        await setDoc(fieldRef, {
            url: musicData,
            updatedAt: new Date().toISOString()
        });

        console.log('✅ Music fixed! URL set to working Archive.org track');
        console.log('🔄 Now refresh your website and click speaker button');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixMusic();
