
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

async function findItems() {
    const snapshot = await getDocs(collection(db, 'menu'));

    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }

    const items = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        items.push({ id: doc.id, name: data.name, category: data.category });
    });

    // Filter for relevant items
    const candidates = items.filter(item => {
        const name = item.name.toLowerCase();
        return (name.includes('noodle') && name.includes('veg')) ||
            (name.includes('chowmein')) ||
            (name.includes('biryani') && name.includes('veg')) ||
            (name.includes('pulao') && name.includes('veg')) ||
            (name.includes('pizza'));
    });

    console.log('Found candidates:', JSON.stringify(candidates, null, 2));
}

findItems();
