const fs = require('fs');
const path = require('path');
// Removed firebase-admin imports
// Initialize Firebase using Client SDK logic below

// Actually, simple client SDK is easier since we have config in fix-menu-images.js
// Let's reuse the client SDK approach from 'fix-menu-images.js' which works.

const { initializeApp } = require('firebase/app');
const { getFirestore: getClientFirestore, collection, getDocs, addDoc, deleteDoc, writeBatch, doc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAi2CbAp5-FvhVZ0FT5pVL4vXc5q4xK-W0",
    authDomain: "charged-satellite-zimpad.firebaseapp.com",
    projectId: "charged-satellite-zimpad",
    storageBucket: "charged-satellite-zimpad.firebasestorage.app",
    messagingSenderId: "410941736916",
    appId: "1:410941736916:web:c1727d34a3ef71c3a93841"
};

const app = initializeApp(firebaseConfig);
const db = getClientFirestore(app);

const GALLERY_DIR = path.join(__dirname, 'public', 'gallery');

async function populateGallery() {
    try {
        console.log('🔍 Reading images from public/gallery...');

        if (!fs.existsSync(GALLERY_DIR)) {
            console.error('❌ Gallery directory not found!');
            return;
        }

        const files = fs.readdirSync(GALLERY_DIR).filter(file =>
            file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.webp')
        );

        console.log(`📦 Found ${files.length} images.`);

        // 1. Clear existing gallery entries to avoid dupes
        console.log('🧹 Clearing existing gallery metadata...');
        const galleryRef = collection(db, 'settings', 'media', 'library');
        const snapshot = await getDocs(galleryRef);
        const batch = writeBatch(db);

        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // 2. Add new entries
        console.log('🚀 Registering images in Admin Gallery...');

        const batchAdd = writeBatch(db);

        files.forEach(file => {
            const name = file.replace(/_/g, ' ')
                .replace('.png', '')
                .replace('.jpg', '')
                .replace(/\d{13}/, '') // Remove timestamp if present
                .trim();

            const docRef = doc(galleryRef); // Auto ID
            batchAdd.set(docRef, {
                id: docRef.id,
                name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
                url: `/gallery/${file}`,
                type: 'image',
                createdAt: new Date().toISOString()
            });
        });

        await batchAdd.commit();

        console.log('✅ Success! All images are now visible in the Admin Gallery tab.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

populateGallery();
