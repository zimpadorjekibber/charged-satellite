
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

async function refineIndianImages() {
    console.log("Refining Indian menu images...");
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    let updatedCount = 0;

    for (const item of items) {
        let newImage = null;

        // 1. Split Breads
        if (item.category === "Indian Bread" || item.category === "Breakfast") {
            if (item.name.includes("Parantha")) {
                newImage = `${BASE}/paratha.png`;
            } else if (item.name.includes("Naan") || item.name.includes("Roti") || item.name.includes("Chapati")) {
                newImage = `${BASE}/indian_breads.png`;
            }
        }

        // 2. Mix Curries (Veg)
        // We have 'veg_curry.png' (Paneer bowl) and 'tashizom_curry.png' (Copper bowls real photo)
        if (item.category === "Vegetable & Dishes" && !item.name.includes("Non-Veg")) {
            // Randomly assign one of the two to break visuals, OR assign logically
            // Let's assign 'tashizom_curry.png' (the orange creamy one) to Shahi/Butter/Creamy dishes
            // And 'veg_curry.png' (Paneer bowl) to others

            if (item.name.includes("Makhani") || item.name.includes("Butter") || item.name.includes("Shahi") || item.name.includes("Malai")) {
                newImage = `${BASE}/tashizom_curry.png`;
            } else {
                newImage = `${BASE}/veg_curry.png`;
            }
        }

        // Apply Update
        if (newImage && item.image !== newImage) {
            console.log(`Updating [${item.name}] -> ${newImage}`);
            await updateDoc(doc(db, 'menu', item.id), { image: newImage });
            updatedCount++;
        }
    }

    console.log(`Refined ${updatedCount} images.`);
    process.exit(0);
}

refineIndianImages();
