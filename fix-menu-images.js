// Script to upload menu AND add placeholder image URLs
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

// Placeholder images from public folder (using Unsplash food photos as temporary images)
const PLACEHOLDER_IMAGES = {
    // Hot Beverages
    'Ginger Lemon Honey Tea': 'https://images.unsplash.com/photo-1597318130039-c3bfe28e70a4?w=400',
    'Kashmiri Kauwa': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400',
    'Jamen Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',

    // Breakfast
    'Indian Breakfast': 'https://images.unsplash.com/photo-1589301773452-b2e3ef5929e0?w=400',
    'American Breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
    'TashiZom Special Breakfast': 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=400',
    'Puri Bhaji': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    'Aloo Parantha': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    'Paneer Parantha': 'https://images.unsplash.com/photo-1642441344085-58d3e761e127?w=400',

    // Pancakes
    'Nutella Pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    'Banana Honey Pancakes': 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400',
    'Chocolate Pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',

    // Soups
    'Cream of Mushroom Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Veg. Manchow Soup': 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400',
    'Chicken Hot & Sour Soup': 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400',

    // Snacks
    'TashiZom Special Veg Kathi Roll': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
    'Veg Spring Roll': 'https://images.unsplash.com/photo-1529589768540-78f13e92c2b0?w=400',
    'Chicken Momos Steamed': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400',
    'Veg. Momos Steamed': 'https://images.unsplash.com/photo-1549488352-22668e9e6c35?w=400',

    // Main Course - Veg
    'Paneer Tikka Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
    'Malai Kofta': 'https://images.unsplash.com/photo-1626074353765-517a65eed519?w=400',
    'Shahi Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
    'Paneer Butter Masala': 'https://images.unsplash.com/photo-1645177628172-a94c30aa1883?w=400',

    // Main Course - Non-Veg
    'Butter Chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    'Chicken Tikka Masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',

    // Chinese
    'Veg Fried Rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    'Chicken Fried Rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    'Gobi Manchurian': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
    'Honey Chilly Potato': 'https://images.unsplash.com/photo-1573081883881-9a96ab5809c1?w=400',

    // Italian
    'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    'Veg Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Chicken Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',

    // Rice
    'Veg Biryani': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400',
    'Gulab Jamun (2 piece)': 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400',
    'Veg/Egg/Chicken Noodle': 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400',

    // New Additions
    'Masala Omelette': 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400',
    'Veg Cheese Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
    'Dal Fry': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    'Butter Naan': 'https://images.unsplash.com/photo-1626082929543-5bab0f006c42?w=400',
    'Jeera Rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400',
    'Green Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    'Chicken/Veg Manchurian': 'https://images.unsplash.com/photo-1550957886-ac45931e5779?w=400',
    'Veg Manchow Soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', // Unique Tomato/Red Soup
    'Rice Pudding': 'https://images.unsplash.com/photo-1515516947383-d15674029840?w=400',
    'Veg Crispy': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
};

async function fixMenuWithImages() {
    try {
        console.log('🔍 Step 1: Clearing existing menu items...\n');

        // Clear existing menu
        const existingSnapshot = await getDocs(collection(db, 'menu'));
        if (existingSnapshot.size > 0) {
            console.log(`📋 Found ${existingSnapshot.size} existing items, deleting...`);
            const deletePromises = existingSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log('✅ Cleared!\n');
        }

        console.log('📋 Step 2: Reading menu data...\n');
        const menuDataPath = path.join(__dirname, 'menu-data.json');
        const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

        console.log(`📦 Found ${menuData.menuItems.length} menu items`);
        console.log('🖼️  Adding placeholder images where available...\n');

        // Add images to menu items
        const itemsWithImages = menuData.menuItems.map(item => ({
            ...item,
            image: PLACEHOLDER_IMAGES[item.name] || '' // Add image if available
        }));

        const itemsWithImageCount = itemsWithImages.filter(item => item.image).length;
        console.log(`✅ ${itemsWithImageCount} items will have images\n`);

        console.log('🚀 Step 3: Uploading to Firebase in batches...\n');

        const BATCH_SIZE = 500;
        let totalUploaded = 0;

        for (let i = 0; i < itemsWithImages.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const batchItems = itemsWithImages.slice(i, i + BATCH_SIZE);

            batchItems.forEach(item => {
                const docRef = doc(collection(db, 'menu'));
                batch.set(docRef, {
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    isVegetarian: item.isVegetarian,
                    available: item.available,
                    image: item.image || ''
                });
            });

            await batch.commit();
            totalUploaded += batchItems.length;
            console.log(`✅ Uploaded ${totalUploaded}/${itemsWithImages.length} items...`);
        }

        console.log('\n' + '='.repeat(70));
        console.log('🎉 SUCCESS! Menu uploaded with images!');
        console.log('='.repeat(70));
        console.log(`📊 Total items: ${totalUploaded}`);
        console.log(`🖼️  Items with images: ${itemsWithImageCount}`);
        console.log(`📦 Items without images: ${totalUploaded - itemsWithImageCount}`);
        console.log('='.repeat(70));
        console.log('\n✨ Your menu is now live with placeholder images!');
        console.log('💡 You can add custom images via Admin Portal later.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixMenuWithImages();
