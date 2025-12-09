// Efficient batch upload using Firebase batch writes
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
    apiKey: "AIzaSyCW1Vb_w8tAqbCNlbYR2WHZLdqLYWs-dvY",
    authDomain: "tashizom.firebaseapp.com",
    projectId: "tashizom",
    storageBucket: "tashizom.firebasestorage.app",
    messagingSenderId: "1059551779677",
    appId: "1:1059551779677:web:67e12f3c8fdd6c29071d21",
    measurementId: "G-HQHVZHMWZR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function batchUploadMenu() {
    try {
        const menuDataPath = path.join(__dirname, 'menu-data.json');
        const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

        console.log(`\n📋 Found ${menuData.menuItems.length} menu items`);
        console.log('🚀 Starting BATCH upload (much faster)...\n');

        const BATCH_SIZE = 500; // Firebase allows 500 writes per batch
        let totalUploaded = 0;

        // Split into batches
        for (let i = 0; i < menuData.menuItems.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const batchItems = menuData.menuItems.slice(i, i + BATCH_SIZE);

            console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchItems.length} items)...`);

            batchItems.forEach(item => {
                const docRef = doc(collection(db, 'menu'));
                batch.set(docRef, {
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    isVegetarian: item.isVegetarian,
                    available: item.available,
                    image: item.image || ''
                });
            });

            await batch.commit();
            totalUploaded += batchItems.length;
            console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} uploaded (${totalUploaded}/${menuData.menuItems.length})\n`);
        }

        console.log('='.repeat(60));
        console.log('🎉 SUCCESS! All menu items uploaded!');
        console.log(`✅ Total uploaded: ${totalUploaded} items`);
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

batchUploadMenu();
