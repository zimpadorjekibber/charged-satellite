// Quick verification script to check menu items with images
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkMenu() {
    try {
        const menuSnapshot = await getDocs(collection(db, 'menu'));

        let totalItems = 0;
        let itemsWithImages = 0;
        const categories = {};

        menuSnapshot.forEach(doc => {
            const data = doc.data();
            totalItems++;

            if (data.image && data.image.length > 0) {
                itemsWithImages++;
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

        console.log('📂 BY CATEGORY:');
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
