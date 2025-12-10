
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

const BASE_URL = "https://tashizomcafe.in/images/placeholders";

const CATEGORY_MAP: any = {
    "Indian Bread": "indian_breads.png",
    "Chinese Course": "chinese_cuisine.png",
    "Vegetable & Dishes": "veg_curry.png",
    "Italian Course": "italian_course.png",
    "Snacks": "snacks.png",
    "Sandwiches": "snacks.png",
    "Non-Veg": "non_veg.png",
    "Breakfast": "breakfast.png",
    "Omelettes": "breakfast.png",
    "Pancakes": "breakfast.png",
    "Cereals": "breakfast.png",
    "Desserts": "desserts.png",
    "Pizza": "italian_course.png",
    "Salads": "veg_curry.png", // Fallback
    "Soups": "chinese_cuisine.png" // Fallback
};

async function updateImages() {
    console.log("Fetching menu...");
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    let updatedCount = 0;

    for (const item of items) {
        // Check if image is missing or is a placeholder
        if (!item.image || item.image.includes('placeholder') || item.image.length < 20) {

            // Determine category
            let imgName = "veg_curry.png"; // Default Fallback

            // 1. Try exact category match
            if (CATEGORY_MAP[item.category]) {
                imgName = CATEGORY_MAP[item.category];
            }
            // 2. Try Name Keyword matching
            else if (item.name.includes("Chicken") || item.name.includes("Egg") || item.name.includes("Non-Veg")) {
                imgName = "non_veg.png";
            } else if (item.name.includes("Paneer") || item.name.includes("Dal") || item.name.includes("Veg")) {
                imgName = "veg_curry.png";
            } else if (item.name.includes("Pizza") || item.name.includes("Pasta")) {
                imgName = "italian_course.png";
            } else if (item.name.includes("Noodle") || item.name.includes("Rice")) {
                imgName = "chinese_cuisine.png";
            } else if (item.name.includes("Sandwich") || item.name.includes("Burger")) {
                imgName = "snacks.png";
            }

            const newUrl = `${BASE_URL}/${imgName}`;

            console.log(`Updating [${item.name}] -> ${imgName}`);
            await updateDoc(doc(db, 'menu', item.id), { image: newUrl });
            updatedCount++;
        }
    }

    console.log(`Updated ${updatedCount} items.`);
    process.exit(0);
}

updateImages();
