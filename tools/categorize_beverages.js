const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, updateDoc, doc, writeBatch } = require('firebase/firestore');

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

const teaAndCoffeeItems = [
    'Green Tea',
    'Lemon Tea',
    'Black Coffee',
    'Mint Tea',
    'Black Tea',
    'Kashmiri Kahwa',
    'Ginger Lemon Honey Tea',
    'Hot Milk',
    'Milk Tea',
    'Milk Coffee',
    'Hot Chocolate'
];

async function splitCategories() {
    try {
        const q = query(collection(db, 'menu'), where('category', '==', 'Beverages & Shakes'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('No "Beverages & Shakes" items found to split.');
            process.exit(0);
        }

        const batch = writeBatch(db);
        let teaCoffeeCount = 0;
        let coldCount = 0;

        snapshot.forEach(d => {
            const data = d.data();
            const ref = doc(db, 'menu', d.id);

            if (teaAndCoffeeItems.includes(data.name)) {
                batch.update(ref, { category: 'Tea & Coffee' });
                teaCoffeeCount++;
                console.log(`Moving "${data.name}" to Tea & Coffee`);
            } else {
                batch.update(ref, { category: 'Cold Beverages & Shakes' });
                coldCount++;
                console.log(`Moving "${data.name}" to Cold Beverages & Shakes`);
            }
        });

        await batch.commit();
        console.log(`\nSuccessfully updated menu items:`);
        console.log(`- Moved to Tea & Coffee: ${teaCoffeeCount}`);
        console.log(`- Moved to Cold Beverages & Shakes: ${coldCount}`);

        process.exit(0);
    } catch (e) {
        console.error('Error updating items:', e);
        process.exit(1);
    }
}

splitCategories();
