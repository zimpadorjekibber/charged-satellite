
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc } = require('firebase/firestore');

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

// CATEGORY MAPPING AND DATA
// Using the exact names provided by user
const newMenuData = [
    // Soups & Salads
    { name: "Cream of Mushroom Soup", price: 110, category: "Soups & Salads", isVegetarian: true },
    { name: "Tomato Soup", price: 100, category: "Soups & Salads", isVegetarian: true },
    { name: "Veg. Noodle Soup", price: 100, category: "Soups & Salads", isVegetarian: true },
    { name: "Veg. Hot & Sour Soup", price: 100, category: "Soups & Salads", isVegetarian: true },
    { name: "Veg. Manchow Soup", price: 100, category: "Soups & Salads", isVegetarian: true },
    { name: "Chicken Soup", price: 120, category: "Soups & Salads", isVegetarian: false },
    { name: "Chicken Hot & Sour Soup", price: 130, category: "Soups & Salads", isVegetarian: false },
    { name: "Green Salad", price: 70, category: "Soups & Salads", isVegetarian: true },
    { name: "Tuna Salad", price: 130, category: "Soups & Salads", isVegetarian: false },
    { name: "Israeli Salad", price: 110, category: "Soups & Salads", isVegetarian: true },

    // Snacks & Starters
    { name: "Tashi Zom Special Veg Kathi Roll", price: 120, category: "Snacks & Starters", isVegetarian: true },
    { name: "Chicken Kathi Roll", price: 140, category: "Snacks & Starters", isVegetarian: false },
    { name: "Finger Chips (French Fries)", price: 110, category: "Snacks & Starters", isVegetarian: true },
    { name: "Veg Pakora", price: 130, category: "Snacks & Starters", isVegetarian: true },
    { name: "Paneer Pakora", price: 180, category: "Snacks & Starters", isVegetarian: true },
    { name: "Chicken Pakora", price: 220, category: "Snacks & Starters", isVegetarian: false },
    { name: "Veg Spring Roll", price: 120, category: "Snacks & Starters", isVegetarian: true },
    { name: "Chicken Spring Roll", price: 150, category: "Snacks & Starters", isVegetarian: false },
    { name: "Masala Papad", price: 60, category: "Snacks & Starters", isVegetarian: true },
    { name: "Peanut Masala", price: 90, category: "Snacks & Starters", isVegetarian: true },
    { name: "Roasted Papad (2 pcs)", price: 20, category: "Snacks & Starters", isVegetarian: true },
    { name: "Veg. Momos (Steamed)", price: 90, category: "Snacks & Starters", isVegetarian: true },
    { name: "Chicken Momos (Steamed)", price: 110, category: "Snacks & Starters", isVegetarian: false },

    // Main Course (Vegetarian)
    { name: "Shahi Paneer", price: 200, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Malai Kofta", price: 220, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Paneer Butter Masala", price: 220, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Matter Paneer", price: 200, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Kadai Paneer", price: 220, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Paneer Do Pyaza", price: 220, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Paneer Tikka Masala", price: 240, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Mix Veg", price: 160, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Jeera Aloo", price: 130, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Kadai Mushroom", price: 200, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Aloo Mutter", price: 140, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Dal Fry", price: 120, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Dal Tadka", price: 140, category: "Main Course (Vegetarian)", isVegetarian: true },
    { name: "Rajma Dal", price: 120, category: "Main Course (Vegetarian)", isVegetarian: true },

    // Main Course (Non-Vegetarian)
    { name: "Chicken Masala", price: 320, category: "Main Course (Non-Vegetarian)", isVegetarian: false },
    { name: "Chicken Do Pyaza", price: 320, category: "Main Course (Non-Vegetarian)", isVegetarian: false },
    { name: "Butter Chicken", price: 350, category: "Main Course (Non-Vegetarian)", isVegetarian: false },
    { name: "Karahi Chicken", price: 320, category: "Main Course (Non-Vegetarian)", isVegetarian: false },
    { name: "Chicken Curry", price: 300, category: "Main Course (Non-Vegetarian)", isVegetarian: false },
    { name: "Chicken Kolhapuri", price: 320, category: "Main Course (Non-Vegetarian)", isVegetarian: false },
    { name: "Chicken Tikka Masala", price: 350, category: "Main Course (Non-Vegetarian)", isVegetarian: false },
    { name: "Egg Curry", price: 140, category: "Main Course (Non-Vegetarian)", isVegetarian: false },

    // Rice & Biryani
    { name: "Veg Pulao", price: 140, category: "Rice & Biryani", isVegetarian: true },
    { name: "Veg Biryani", price: 170, category: "Rice & Biryani", isVegetarian: true },
    { name: "Chicken Biryani", price: 200, category: "Rice & Biryani", isVegetarian: false },
    { name: "Plain Rice", price: 90, category: "Rice & Biryani", isVegetarian: true },
    { name: "Jeera Rice", price: 110, category: "Rice & Biryani", isVegetarian: true },
    { name: "Lemon Butter Rice", price: 130, category: "Rice & Biryani", isVegetarian: true },

    // Indian Breads
    { name: "Plain Roti", price: 15, category: "Indian Breads", isVegetarian: true },
    { name: "Butter Roti", price: 20, category: "Indian Breads", isVegetarian: true },
    { name: "Cheese Roti", price: 50, category: "Indian Breads", isVegetarian: true },
    { name: "Plain Naan (Tawa)", price: 40, category: "Indian Breads", isVegetarian: true },
    { name: "Butter Naan", price: 50, category: "Indian Breads", isVegetarian: true },
    { name: "Cheese Garlic Naan", price: 90, category: "Indian Breads", isVegetarian: true },
    { name: "Cheese Naan", price: 80, category: "Indian Breads", isVegetarian: true },
    { name: "Lachha Parantha", price: 40, category: "Indian Breads", isVegetarian: true },
    { name: "Plain Parantha", price: 30, category: "Indian Breads", isVegetarian: true },

    // Chinese
    { name: "Chicken Noodle", price: 160, category: "Chinese", isVegetarian: false },
    { name: "Veg Noodle", price: 130, category: "Chinese", isVegetarian: true },
    { name: "Egg Noodle", price: 140, category: "Chinese", isVegetarian: false },
    { name: "Veg Fried Rice", price: 130, category: "Chinese", isVegetarian: true },
    { name: "Chicken Fried Rice", price: 160, category: "Chinese", isVegetarian: false },
    { name: "Egg Fried Rice", price: 150, category: "Chinese", isVegetarian: false },
    { name: "Chicken Manchurian", price: 220, category: "Chinese", isVegetarian: false },
    { name: "Veg Manchurian", price: 160, category: "Chinese", isVegetarian: true },
    { name: "Chicken Chilly", price: 220, category: "Chinese", isVegetarian: false },
    { name: "Paneer Chilly", price: 200, category: "Chinese", isVegetarian: true },
    { name: "Chilly Potato", price: 130, category: "Chinese", isVegetarian: true },
    { name: "Veg Crispy", price: 140, category: "Chinese", isVegetarian: true },
    { name: "Gobi Manchurian", price: 150, category: "Chinese", isVegetarian: true },
    { name: "Mushroom Chilly", price: 200, category: "Chinese", isVegetarian: true },
    { name: "Honey Chilly Cauliflower", price: 160, category: "Chinese", isVegetarian: true },
    { name: "Honey Chilly Potato", price: 150, category: "Chinese", isVegetarian: true },
    { name: "Chicken 65", price: 230, category: "Chinese", isVegetarian: false },
    { name: "Chicken Crispy", price: 230, category: "Chinese", isVegetarian: false },
    { name: "Veg Maggi", price: 70, category: "Chinese", isVegetarian: true },
    { name: "Plain Maggi", price: 50, category: "Chinese", isVegetarian: true },

    // Pizza & Pasta
    { name: "Margherita Pizza", price: 200, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Ai Funghi Pizza", price: 230, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Al Pollo Pizza", price: 250, category: "Pizza & Pasta", isVegetarian: false },
    { name: "Capsicum Onion Pizza", price: 210, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Veg Pizza", price: 220, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Chicken Pizza", price: 260, category: "Pizza & Pasta", isVegetarian: false },
    { name: "Veg Corn Pizza", price: 230, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Pomodoro Spaghetti", price: 200, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Spaghetti Pene e Funghi", price: 220, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Carbonara Spaghetti", price: 240, category: "Pizza & Pasta", isVegetarian: false },
    { name: "Bolognaise Spaghetti", price: 260, category: "Pizza & Pasta", isVegetarian: false },
    { name: "Mushroom Pasta (Cheese Sauce)", price: 220, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Pasta Averdura", price: 200, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Pasta Cheese Tomato Garlic", price: 200, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Pasta White Sauce", price: 220, category: "Pizza & Pasta", isVegetarian: true },
    { name: "Pasta Tomato Sauce", price: 200, category: "Pizza & Pasta", isVegetarian: true },

    // Beverages & Shakes
    { name: "Milk Tea", price: 30, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Hot Chocolate", price: 60, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Black Tea", price: 20, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Milk Coffee", price: 50, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Black Coffee", price: 30, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Hot Milk", price: 30, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Ginger Lemon Honey Tea", price: 40, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Mint Tea", price: 30, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Green Tea", price: 30, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Kashmiri Kahwa", price: 50, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Lemon Tea", price: 30, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Lemon Water", price: 40, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Plain Soda", price: 30, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Lime Soda", price: 60, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Banana Milk Shake", price: 80, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Chocolate Shake", price: 90, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Vanilla Shake", price: 90, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Mango Shake", price: 90, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Oreo Milk Shake", price: 100, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Banana Lassi", price: 70, category: "Beverages & Shakes", isVegetarian: true },
    { name: "Sweet Lassi", price: 60, category: "Beverages & Shakes", isVegetarian: true },

    // Desserts
    { name: "Hello to the Queen", price: 130, category: "Desserts", isVegetarian: true },
    { name: "Banana Fritter (Filter)", price: 100, category: "Desserts", isVegetarian: true },
    { name: "Rice Pudding", price: 90, category: "Desserts", isVegetarian: true },
    { name: "Chocolate Bowl (2 pcs)", price: 80, category: "Desserts", isVegetarian: true },
    { name: "Gulab Jamun (2 pcs)", price: 50, category: "Desserts", isVegetarian: true }
];

async function addMissingItems() {
    console.log('Fetching existing menu items...');
    const snapshot = await getDocs(collection(db, 'menu'));

    // Normalize helper
    const normalize = (str) => {
        return str.toLowerCase()
            .replace(/[().,]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/ steamed/g, '')
            .replace(/ fried/g, '')
            .replace(/ pcs/g, '')
            .trim();
    };

    const existingItems = new Set();
    snapshot.forEach(doc => {
        const data = doc.data();
        existingItems.add(normalize(data.name));
        existingItems.add(data.name.toLowerCase().trim()); // Conservative check
    });

    let addedCount = 0;
    const batchPromises = [];

    for (const item of newMenuData) {
        const normalizedName = normalize(item.name);

        let exists = false;

        // Check exact or normalized
        if (existingItems.has(normalizedName) || existingItems.has(item.name.toLowerCase().trim())) {
            exists = true;
        } else {
            // Check substrings for robust dup detection
            for (const existing of existingItems) {
                if (existing.includes(normalizedName) || normalizedName.includes(existing)) {
                    exists = true;
                    //console.log(`Skipping potential duplicate: "${item.name}" matches existing "${existing}"`);
                    break;
                }
            }
        }

        if (!exists) {
            console.log(`adding NEW Item: ${item.name} (${item.category}) - ₹${item.price}`);
            batchPromises.push(addDoc(collection(db, 'menu'), {
                name: item.name,
                price: item.price,
                category: item.category,
                isVegetarian: item.isVegetarian,
                available: true,
                description: "Delicious " + item.category + " item", // Default description
                createdAt: new Date().toISOString()
            }));
            addedCount++;
        }
    }

    if (batchPromises.length > 0) {
        await Promise.all(batchPromises);
        console.log(`\n✅ Successfully added ${addedCount} new items to the menu.`);
    } else {
        console.log('\n✅ All items already exist. No duplicates added.');
    }
}

addMissingItems();
