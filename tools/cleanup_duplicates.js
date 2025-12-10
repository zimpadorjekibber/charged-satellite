
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

const TARGET_GOOD_CATEGORIES = [
    "Soups & Salads", "Snacks & Starters", "Main Course (Vegetarian)",
    "Main Course (Non-Vegetarian)", "Rice & Biryani", "Indian Breads",
    "Chinese", "Pizza & Pasta", "Beverages & Shakes", "Desserts",
    "Breakfast", "Omelettes", "Pancakes", "Sandwiches", "Cereals" // Keeping breakfast items for now as they weren't explicitly replaced
];

const BAD_CATEGORIES = [
    "Italian Course", "Pizza", "Vegetable & Dishes", "Snacks", "Hot Beverages"
];

async function cleanupDuplicates() {
    console.log('Fetching all menu items...');
    const snapshot = await getDocs(collection(db, 'menu'));

    const items = [];
    snapshot.forEach(d => items.push({ id: d.id, ...d.data() }));

    const deletions = [];

    // Helper to normalize
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Remove items in Explicitly Bad Categories
    for (const item of items) {
        if (BAD_CATEGORIES.includes(item.category)) {
            console.log(`🗑️ Deleting item in Bad Category [${item.category}]: ${item.name}`);
            deletions.push(deleteDoc(doc(db, 'menu', item.id)));
            // Mark as deleted so we don't process it below
            item._deleted = true;
        }
    }

    // 2. Find Name Duplicates (e.g. "Veg Pakora" in 'Snacks' (deleted above) and 'Snacks & Starters')
    // Since we already deleted BAD_CATEGORY items, we now check generally for other duplicates.

    // Group by Normalized Name
    const groups = {};
    for (const item of items) {
        if (item._deleted) continue;
        const norm = normalize(item.name);
        if (!groups[norm]) groups[norm] = [];
        groups[norm].push(item);
    }

    for (const [norm, group] of Object.entries(groups)) {
        if (group.length > 1) {
            console.log(`\nFound duplicate group: "${group[0].name}" (${group.length})`);

            // Score them: Prefer items in GOOD categories
            // If multiple in good categories, prefer the one created most recently? (Can't tell easily without timestamp parsing or assuming)
            // Strategy: Keep 1, delete rest. 
            // Priority: New Official Categories > Breakfast Categories > Others

            group.sort((a, b) => {
                const aScore = TARGET_GOOD_CATEGORIES.includes(a.category) ? 2 : 1;
                const bScore = TARGET_GOOD_CATEGORIES.includes(b.category) ? 2 : 1;
                return bScore - aScore; // Descending
            });

            const winner = group[0];
            const losers = group.slice(1);

            console.log(`  ✅ Keeping: "${winner.name}" [${winner.category}]`);
            for (const loser of losers) {
                console.log(`  ❌ Deleting Duplicate: "${loser.name}" [${loser.category}]`);
                deletions.push(deleteDoc(doc(db, 'menu', loser.id)));
            }
        }
    }

    if (deletions.length > 0) {
        await Promise.all(deletions);
        console.log(`\nSuccessfully deleted ${deletions.length} items/duplicates.`);
    } else {
        console.log('\nNo further duplicates found.');
    }
}

cleanupDuplicates();
