
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

async function listCategories() {
    console.log('Fetching all menu items...');
    const snapshot = await getDocs(collection(db, 'menu'));

    const categoryCounts = {};
    const categoryItems = {};

    snapshot.forEach(doc => {
        const item = doc.data();
        const cat = item.category || 'Uncategorized';

        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        if (!categoryItems[cat]) categoryItems[cat] = [];
        if (categoryItems[cat].length < 5) {
            categoryItems[cat].push(item.name);
        }
    });

    console.log('\n--- Current Categories ---');
    for (const [cat, count] of Object.entries(categoryCounts)) {
        console.log(`[${count}] ${cat}`);
        console.log(`    Examples: ${categoryItems[cat].join(', ')}...`);
    }
}

listCategories();
