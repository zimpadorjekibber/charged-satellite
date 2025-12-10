import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteGalleryImage() {
    try {
        const mediaSnapshot = await getDocs(collection(db, 'media'));

        console.log(`Found ${mediaSnapshot.size} media items`);

        for (const docSnapshot of mediaSnapshot.docs) {
            const data = docSnapshot.data();
            console.log(`Checking: ${data.title || 'No title'}`);

            if (data.title && data.title.toLowerCase().includes('original food photo 1')) {
                console.log(`Found matching image: ${data.title} (ID: ${docSnapshot.id})`);
                console.log(`Deleting...`);
                await deleteDoc(doc(db, 'media', docSnapshot.id));
                console.log(`✓ Deleted successfully`);
                process.exit(0);
            }
        }

        console.log('No matching image found.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteGalleryImage();
