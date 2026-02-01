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

async function addSampleMusic() {
    try {
        // Public domain ambient music from Archive.org
        // This is "Gymnopedie No 1" by Erik Satie (public domain)
        const sampleMusicUrl = "https://ia803109.us.archive.org/29/items/GymnopdieNo.1/Gymnopedie_No_1.mp3";

        const musicData = {
            home: sampleMusicUrl,
            menu: "",
            story: "",
            location: "",
            winter: ""
        };

        const fieldRef = doc(db, 'settings', 'landing_photos', 'fields', 'backgroundMusic');
        await setDoc(fieldRef, {
            url: musicData,
            updatedAt: new Date().toISOString()
        });

        console.log('✅ Sample music added successfully!');
        console.log('🎵 Music URL:', sampleMusicUrl);
        console.log('📝 Track: Gymnopedie No. 1 by Erik Satie (Public Domain)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding sample music:', error);
        process.exit(1);
    }
}

addSampleMusic();
