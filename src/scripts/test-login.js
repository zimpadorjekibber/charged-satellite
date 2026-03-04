import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testLogin() {
    console.log('Testing login for tanzintsore@gmail.com...');

    try {
        const password = process.argv[2]; // Pass via command line
        if (!password) {
            console.log('Please provide a password as an argument.');
            return;
        }

        console.log('Attempting auth...');
        const cred = await signInWithEmailAndPassword(auth, 'tanzintsore@gmail.com', password);
        console.log('Auth successful. UID:', cred.user.uid);

        console.log('Fetching user document from Firestore...');
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));

        if (userDoc.exists()) {
            console.log('User document found:');
            console.log(userDoc.data());

            if (userDoc.data().role === 'admin') {
                console.log('✅ User is an admin');
            } else {
                console.log('❌ User is NOT an admin. Role:', userDoc.data().role);
            }
        } else {
            console.log('❌ User document NOT found in Firestore users collection!');
        }
    } catch (error) {
        console.error('Login failed:', error.message);
    }
}

testLogin();
