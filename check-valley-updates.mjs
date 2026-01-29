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

async function checkValleyUpdates() {
    try {
        const valleyRef = doc(db, 'settings', 'valley_updates');
        const snap = await getDoc(valleyRef);

        if (snap.exists()) {
            const data = snap.data();
            console.log('Valley Updates found:');
            console.log(JSON.stringify(data, null, 2));

            if (data.updates && Array.isArray(data.updates)) {
                console.log(`\n✅ Total updates: ${data.updates.length}`);
                data.updates.forEach((update, idx) => {
                    console.log(`\nUpdate ${idx + 1}:`);
                    console.log(`  Title: ${update.title}`);
                    console.log(`  MediaType: ${update.mediaType || 'NOT SET'}`);
                    console.log(`  MediaUrl: ${update.mediaUrl || 'NOT SET'}`);
                });
            } else {
                console.log('❌ No updates array found');
            }
        } else {
            console.log('❌ No valley_updates document found in settings collection');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    process.exit(0);
}

checkValleyUpdates();
