
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

const BASE = "https://tashizomcafe.in/images/placeholders";

async function refineChineseImages() {
    console.log("Refining Chinese menu images...");
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    let updatedCount = 0;

    for (const item of items) {
        let newImage = null;

        // Specific Keyword Matches for Chinese items
        if (item.name.includes("Momo")) {
            newImage = `${BASE}/momos.png`;
        }
        else if (item.name.includes("Thukpa")) {
            newImage = `${BASE}/thukpa.png`;
        }
        else if (item.name.includes("Chowmein") || (item.name.includes("Noodle") && !item.name.includes("Soup"))) {
            newImage = `${BASE}/chowmein.png`;
        }

        // Apply Update
        // Only update if it's currently using the generic 'chinese_cuisine.png' OR if we want to force these betters ones.
        // Let's force update if we have a match, as these new ones are specific.
        if (newImage && item.image !== newImage) {
            console.log(`Updating [${item.name}] -> ${newImage}`);
            await updateDoc(doc(db, 'menu', item.id), { image: newImage });
            updatedCount++;
        }
    }

    console.log(`Refined ${updatedCount} images.`);
    process.exit(0);
}

refineChineseImages();
