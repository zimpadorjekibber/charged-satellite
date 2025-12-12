// Quick verification script to check menu items with images
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAi2CbAp5-FvhVZ0FT5pVL4vXc5q4xK-W0",
    authDomain: "charged-satellite-zimpad.firebaseapp.com",
    projectId: "charged-satellite-zimpad",
    storageBucket: "charged-satellite-zimpad.firebasestorage.app",
    messagingSenderId: "410941736916",
    appId: "1:410941736916:web:c1727d34a3ef71c3a93841"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkMenu() {
    try {
        const menuSnapshot = await getDocs(collection(db, 'menu'));

        let totalItems = 0;
        let itemsWithImages = 0;
        const categories = {};
        const imageUsage = {}; // Track image usage

        menuSnapshot.forEach(doc => {
            const data = doc.data();
            totalItems++;

            if (data.image && data.image.length > 0) {
                itemsWithImages++;
                // Track duplicate images
                if (!imageUsage[data.image]) {
                    imageUsage[data.image] = [];
                }
                imageUsage[data.image].push(data.name);
            }

            if (!categories[data.category]) {
                categories[data.category] = { total: 0, withImages: 0 };
            }
            categories[data.category].total++;
            if (data.image && data.image.length > 0) {
                categories[data.category].withImages++;
            }
        });

        console.log('\n' + '='.repeat(70));
        console.log('📊 MENU STATUS REPORT');
        console.log('='.repeat(70));
        console.log(`\n📋 Total Menu Items: ${totalItems}`);
        console.log(`🖼️  Items with Images: ${itemsWithImages}`);
        console.log(`📦 Items without Images: ${totalItems - itemsWithImages}\n`);

        console.log('⚠️  POTENTIAL MISMATCHES (Duplicate Images):');
        let mismatchCount = 0;

        console.log('\n--- DEBUG: FIRST 10 IMAGE PATHS IN DB ---');
        let debugCount = 0;
        menuSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.image && debugCount < 10) {
                console.log(`[${doc.id}] ${data.image}`);
                debugCount++;
            }
        });
        console.log('-----------------------------------------\n');

        Object.entries(imageUsage).forEach(([url, items]) => {
            if (items.length > 1) {
                mismatchCount++;
                console.log(`   🔸 Image used by ${items.length} items: ${items.join(', ')}`);
            }
        });
        if (mismatchCount === 0) console.log('   ✅ No duplicate images found.');

        console.log('\n📂 BY CATEGORY:');
        console.log('-'.repeat(70));

        Object.keys(categories).sort().forEach(cat => {
            const info = categories[cat];
            const percentage = Math.round((info.withImages / info.total) * 100);
            console.log(`   ${cat.padEnd(30)} ${info.withImages}/${info.total} (${percentage}%)`);
        });

        console.log('='.repeat(70) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkMenu();
