
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import * as fs from 'fs';

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

async function checkImages() {
    console.log("Fetching menu...");
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // items with NO image or dummy placeholder
    const buffer = [];
    for (const item of items) {
        if (!item.image || item.image.includes('placeholder') || item.image.length < 20) {
            buffer.push(`${item.name} (${item.category || 'Uncategorized'})`);
        }
    }

    console.log(`Found ${buffer.length} items needing images. Showing first 10:`);
    fs.writeFileSync('missing_items.json', JSON.stringify(buffer, null, 2));
    console.log("Written to missing_items.json");
    process.exit(0);
}

checkImages();
