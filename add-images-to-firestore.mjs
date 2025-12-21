import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Your Firebase config (from .env)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const imagesToAdd = [
    {
        name: 'Chicken Spring Roll',
        url: '/gallery/chicken_spring_roll_1765973891653.png'
    },
    {
        name: 'Light Breakfast Set',
        url: '/gallery/light_breakfast_set_1765972981488.png'
    },
    {
        name: 'Signature Breakfast Spread',
        url: '/gallery/signature_breakfast_spread_1765971790866.png'
    }
];

async function addImagesToFirestore() {
    try {
        const mediaCollection = collection(db, 'media');

        for (const image of imagesToAdd) {
            // Check if exists
            const q = query(mediaCollection, where('url', '==', image.url));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log(`Adding ${image.name}...`);
                await addDoc(mediaCollection, {
                    name: image.name,
                    url: image.url,
                    type: 'image',
                    createdAt: new Date().toISOString()
                });
                console.log(`✓ Added ${image.name}`);
            } else {
                console.log(`Skipping ${image.name} (already exists)`);
            }
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addImagesToFirestore();
