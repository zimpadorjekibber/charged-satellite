
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

// Base URL for images
const BASE = "https://tashizomcafe.in/images/placeholders";

// Specific mappings for Breakfast items to ensure variety and food-focus
const IMAGE_MAP: any = {
    // Exact Name Matches
    "Set Breakfast": "special_breakfast.jpg", // User Uploaded
    "Continental Breakfast": "continental_breakfast.png",

    "Lemon Honey Porridge": "porridge.png",

    "Banana Muesli with Curd Honey": "muesli.png",
    "Muesli with Curd Honey": "muesli.png",

    "Banana Cornflakes with Milk": "cornflakes.png",

    "Lemon Honey Pancakes": "breakfast.png", // Use the pancake/omelette combo or specific if available
    "Coconut Chocolate Pancakes": "breakfast.png",
    "Lemon Sugar Pancakes": "breakfast.png",

    "Gobhi Parantha": "paratha.png",
    "Plain Parantha": "paratha.png",
    "Mix Parantha": "paratha.png",
    "Lachha Parantha": "paratha.png",

    // Category Fallbacks (if name doesn't match above)
    "Indian Bread": "indian_breads.png",
    "Chinese Course": "chinese_cuisine.png",
    "Vegetable & Dishes": "veg_curry.png",
    "Italian Course": "italian_course.png",
    "Snacks": "snacks.png",
    "Non-Veg": "non_veg.png",
    "Desserts": "desserts.png",
};

async function refineBreakfastImages() {
    console.log("Refining menu images...");
    const snap = await getDocs(collection(db, 'menu'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    let updatedCount = 0;

    for (const item of items) {
        let newImage = null;

        // 1. Check for Exact Name Match (Highest Priority)
        if (IMAGE_MAP[item.name]) {
            newImage = `${BASE}/${IMAGE_MAP[item.name]}`;
        }
        // 2. Check for Keyword Matches for specific new assets
        else if (item.name.includes("Parantha")) {
            newImage = `${BASE}/paratha.png`;
        }
        else if (item.name.includes("Porridge")) {
            newImage = `${BASE}/porridge.png`;
        }
        else if (item.name.includes("Muesli")) {
            newImage = `${BASE}/muesli.png`;
        }
        else if (item.name.includes("Cornflakes")) {
            newImage = `${BASE}/cornflakes.png`;
        }

        // Only update if we found a better specific image
        // AND the current image is a generic placeholder (or we want to force override specific bad ones like the repeated breakfast one)
        // We will force update all breakfast items to be sure.
        if (newImage && (item.category === 'Breakfast' || item.category === 'Cereals' || item.category === 'Pancakes' || item.category === 'Indian Bread')) {
            console.log(`Updating [${item.name}] -> ${newImage}`);
            await updateDoc(doc(db, 'menu', item.id), { image: newImage });
            updatedCount++;
        }
    }

    console.log(`Refined ${updatedCount} images.`);
    process.exit(0);
}

refineBreakfastImages();
