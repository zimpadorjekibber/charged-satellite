
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

async function removeAllImages() {
    console.log("Fetching menu items...");
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log(`Found ${items.length} items. Removing images...`);

    let count = 0;
    const batchSize = 10;

    // Process in chunks to avoid overwhelming the network
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(async (item) => {
            if (item.image) {
                console.log(`Removing image for: ${item.name}`);
                await updateDoc(doc(db, 'menu', item.id), {
                    image: "" // Clear the image
                });
                count++;
            }
        }));
    }

    console.log(`Successfully removed images from ${count} items.`);
    process.exit(0);
}

removeAllImages();
