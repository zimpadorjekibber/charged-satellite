// Script to upload menu items to Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCW1Vb_w8tAqbCNlbYR2WHZLdqLYWs-dvY",
    authDomain: "tashizom.firebaseapp.com",
    projectId: "tashizom",
    storageBucket: "tashizom.firebasestorage.app",
    messagingSenderId: "1059551779677",
    appId: "1:1059551779677:web:67e12f3c8fdd6c29071d21",
    measurementId: "G-HQHVZHMWZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadMenu() {
    try {
        // Read the menu data
        const menuDataPath = path.join(__dirname, 'menu-data.json');
        const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

        console.log(`📋 Found ${menuData.menuItems.length} menu items to upload`);
        console.log('🚀 Starting upload to Firebase...\n');

        let successCount = 0;
        let errorCount = 0;

        // Upload each item
        for (const item of menuData.menuItems) {
            try {
                await addDoc(collection(db, 'menu'), {
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    isVegetarian: item.isVegetarian,
                    available: item.available,
                    image: item.image || '' // Empty string if no image
                });

                successCount++;
                console.log(`✅ [${successCount}/${menuData.menuItems.length}] Added: ${item.name} (${item.category}) - ₹${item.price}`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Error adding ${item.name}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Upload Summary:');
        console.log(`   ✅ Successfully uploaded: ${successCount} items`);
        console.log(`   ❌ Failed: ${errorCount} items`);
        console.log('='.repeat(60));
        console.log('\n🎉 Menu upload completed!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the upload
uploadMenu();
