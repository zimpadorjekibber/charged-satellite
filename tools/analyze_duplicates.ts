
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

async function analyzeDuplicates() {
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const urlCounts: { [key: string]: string[] } = {};

    items.forEach(item => {
        const data = item as any;
        if (!data.image) return;
        const filename = data.image.split('/').pop();
        if (!urlCounts[filename]) urlCounts[filename] = [];
        urlCounts[filename].push(data.name);
    });

    console.log("--- REPEATED IMAGES ---");
    for (const [img, names] of Object.entries(urlCounts)) {
        if (names.length > 2) {
            console.log(`\nIMAGE: ${img} (Used ${names.length} times)`);
            console.log(names.slice(0, 10).join(', ') + (names.length > 10 ? '...' : ''));
        }
    }
    process.exit(0);
}

analyzeDuplicates();
