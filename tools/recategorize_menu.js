
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
require('dotenv').config();

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

// Mapping of Items to New Categories
const categoriesMap = {
    "Soups & Salads": [
        "Cream of Mushroom Soup", "Tomato Soup", "Veg. Noodle Soup", "Veg. Hot & Sour Soup",
        "Veg. Manchow Soup", "Chicken Soup", "Chicken Hot & Sour Soup", "Green Salad",
        "Tuna Salad", "Israeli Salad"
    ],
    "Snacks & Starters": [
        "Tashi Zom Special Veg Kathi Roll", "Chicken Kathi Roll", "Finger Chips (French Fries)",
        "Veg Pakora", "Paneer Pakora", "Chicken Pakora", "Veg Spring Roll", "Chicken Spring Roll",
        "Masala Papad", "Peanut Masala", "Roasted Papad (2 pcs)", "Veg. Momos (Steamed)",
        "Chicken Momos (Steamed)"
    ],
    "Main Course (Vegetarian)": [
        "Shahi Paneer", "Malai Kofta", "Paneer Butter Masala", "Matter Paneer", "Kadai Paneer",
        "Paneer Do Pyaza", "Paneer Tikka Masala", "Mix Veg", "Jeera Aloo", "Kadai Mushroom",
        "Aloo Mutter", "Dal Fry", "Dal Tadka", "Rajma Dal"
    ],
    "Main Course (Non-Vegetarian)": [
        "Chicken Masala", "Chicken Do Pyaza", "Butter Chicken", "Karahi Chicken",
        "Chicken Curry", "Chicken Kolhapuri", "Chicken Tikka Masala", "Egg Curry"
    ],
    "Rice & Biryani": [
        "Veg Pulao", "Veg Biryani", "Chicken Biryani", "Plain Rice", "Jeera Rice",
        "Lemon Butter Rice"
    ],
    "Indian Breads": [
        "Plain Roti", "Butter Roti", "Cheese Roti", "Plain Naan (Tawa)", "Butter Naan",
        "Cheese Garlic Naan", "Cheese Naan", "Lachha Parantha", "Plain Parantha"
    ],
    "Chinese": [
        "Chicken Noodle", "Veg Noodle", "Egg Noodle", "Veg Fried Rice", "Chicken Fried Rice",
        "Egg Fried Rice", "Chicken Manchurian", "Veg Manchurian", "Chicken Chilly", "Paneer Chilly",
        "Chilly Potato", "Veg Crispy", "Gobi Manchurian", "Mushroom Chilly", "Honey Chilly Cauliflower",
        "Honey Chilly Potato", "Chicken 65", "Chicken Crispy", "Veg Maggi", "Plain Maggi"
    ],
    "Pizza & Pasta": [
        "Margherita Pizza", "Ai Funghi Pizza", "Al Pollo Pizza", "Capsicum Onion Pizza", "Veg Pizza",
        "Chicken Pizza", "Veg Corn Pizza", "Pomodoro Spaghetti", "Spaghetti Pene e Funghi",
        "Carbonara Spaghetti", "Bolognaise Spaghetti", "Mushroom Pasta (Cheese Sauce)",
        "Pasta Averdura", "Pasta Cheese Tomato Garlic", "Pasta White Sauce", "Pasta Tomato Sauce"
    ],
    "Beverages & Shakes": [
        "Milk Tea", "Hot Chocolate", "Black Tea", "Milk Coffee", "Black Coffee", "Hot Milk",
        "Ginger Lemon Honey Tea", "Mint Tea", "Green Tea", "Kashmiri Kahwa", "Lemon Tea",
        "Lemon Water", "Plain Soda", "Lime Soda", "Banana Milk Shake", "Chocolate Shake",
        "Vanilla Shake", "Mango Shake", "Oreo Milk Shake", "Banana Lassi", "Sweet Lassi"
    ],
    "Desserts": [
        "Hello to the Queen", "Banana Fritter (Filter)", "Rice Pudding",
        "Chocolate Bowl (2 pcs)", "Gulab Jamun (2 pcs)"
    ]
};

async function recategorizeMenu() {
    console.log('Fetching menu items for recategorization...');
    const snapshot = await getDocs(collection(db, 'menu'));

    if (snapshot.empty) {
        console.log('No items found.');
        return;
    }

    const updates = [];
    const itemMap = new Map();

    // Helper to normalize strings for comparison
    const normalize = (str) => {
        return str.toLowerCase()
            .replace(/[().,]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ')   // Collapse spaces
            .replace(/ steamed/g, '') // Remove common variations
            .replace(/ fried/g, '')
            .replace(/ pcs/g, '')
            .trim();
    };

    // Map existing items by Normalized Name -> Doc ID
    snapshot.forEach(doc => {
        const data = doc.data();
        itemMap.set(normalize(data.name), doc.id);
        // Also map exact original name just in case
        itemMap.set(data.name.toLowerCase().trim(), doc.id);
    });

    let updatedCount = 0;

    for (const [newCategory, items] of Object.entries(categoriesMap)) {
        for (const itemName of items) {
            const normalizedKey = normalize(itemName);

            // Try to find a match
            let docId = itemMap.get(normalizedKey);

            // Fallback: Check for partial includes (e.g. "Veg Momos" inside "Veg. Momos (Steamed)")
            if (!docId) {
                for (const [dbName, id] of itemMap.entries()) {
                    if (dbName.includes(normalizedKey) || normalizedKey.includes(dbName)) {
                        docId = id;
                        break;
                    }
                }
            }

            if (docId) {
                updates.push(updateDoc(doc(db, 'menu', docId), { category: newCategory }));
                console.log(`Updated: "${itemName}" -> ${newCategory}`);
                updatedCount++;
            } else {
                console.warn(`⚠️ Item not found in DB: "${itemName}" (Normalized: ${normalizedKey})`);
            }
        }
    }

    if (updates.length > 0) {
        await Promise.all(updates);
        console.log(`✅ Successfully updated ${updatedCount} items to new categories.`);
    } else {
        console.log('No updates needed.');
    }
}

recategorizeMenu();
