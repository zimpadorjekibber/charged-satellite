
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function analyzeRemainingDuplicates() {
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Group by Category and Image
    const catImages: { [key: string]: { [img: string]: string[] } } = {};

    items.forEach(item => {
        if (!item.image) return;
        const filename = item.image.split('/').pop();

        if (!catImages[item.category]) catImages[item.category] = {};
        if (!catImages[item.category][filename]) catImages[item.category][filename] = [];

        catImages[item.category][filename].push(item.name);
    });

    console.log("--- DUPLICATION ANALYSIS ---");
    const targetCats = ['Italian Course', 'Pizza', 'Snacks', 'Salads', 'Soups', 'Sandwiches', 'Rice, Pulao, Biryani'];

    for (const cat of targetCats) {
        console.log(`\nCATEGORY: ${cat}`);
        if (!catImages[cat]) {
            console.log("  (No items)");
            continue;
        }
        for (const [img, names] of Object.entries(catImages[cat])) {
            if (names.length > 1) {
                console.log(`  IMAGE: ${img} (x${names.length}) -> ${names.join(', ')}`);
            }
        }
    }
    process.exit(0);
}

analyzeRemainingDuplicates();
