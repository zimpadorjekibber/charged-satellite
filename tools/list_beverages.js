const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, updateDoc, doc } = require('firebase/firestore');

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

async function listBeverages() {
    try {
        const q = query(collection(db, 'menu'), where('category', '==', 'Beverages & Shakes'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('No matching documents.');
            process.exit(0);
        }

        console.log("Current Items in 'Beverages & Shakes':");
        snapshot.forEach(d => {
            console.log(`${d.id} : ${d.data().name}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listBeverages();
