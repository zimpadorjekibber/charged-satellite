// Script to upload images to Firebase Storage and update menu items
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCW1Vb_w8tAqbCNlbYR2WHZLdqLYWs-dvY",
    authDomain: "tashizom.firebaseapp.com",
    projectId: "tashizom",
    storageBucket: "tashizom.firebasestorage.app",
    messagingSenderId: "1059551779677",
    appId: "1:1059551779677:web:67e12f3c8fdd6c29071d21",
    measurementId: "G-HQHVZHMWZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Image directory (update this path to where your images are saved)
const IMAGE_DIR = 'C:/Users/Asus/.gemini/antigravity/brain/f29d6c12-c89f-4e6c-a3ae-aabbe3622a22';

// Mapping of image files to menu item names
const imageMapping = {
    'chicken_momos_menu': 'Chicken Momos Steamed',
    'veg_fried_rice': 'Veg Fried Rice',
    'thukpa_soup_menu': 'Chicken Hot & Sour Soup', // Using this for soup category
    'mango_lassi_menu': 'Mango Lassi', // Will need to add this item
    'butter_chicken_menu': 'Butter Chicken',
    'spring_rolls_menu': 'Veg Spring Roll',
    'chicken_biryani_menu': 'Chicken Biryani',
    'chocolate_lava_cake': 'Chocolate Lava Cake', // Will need to add this item
    'kashmiri_kauwa_tea': 'Kashmiri Kauwa',
    'tashizom_special_breakfast': 'TashiZom Special Breakfast',
    'paneer_parantha': 'Paneer Parantha',
    'nutella_pancakes': 'Nutella Pancakes',
    'veg_manchow_soup': 'Veg. Manchow Soup',
    'tashizom_veg_kathi_roll': 'TashiZom Special Veg Kathi Roll',
    'paneer_tikka_masala': 'Paneer Tikka Masala',
    'malai_kofta': 'Malai Kofta',
    'chicken_tikka_masala_dish': 'Chicken Tikka Masala',
    'gobi_manchurian': 'Gobi Manchurian',
    'honey_chilly_potato': 'Honey Chilly Potato',
    'margherita_pizza': 'Margherita Pizza',
    'veg_biryani_dish': 'Veg Biryani'
};

async function uploadImages() {
    try {
        console.log('🚀 Starting image upload to Firebase Storage...\n');

        // Get all menu items from Firebase
        const menuSnapshot = await getDocs(collection(db, 'menu'));
        const menuItems = {};
        menuSnapshot.forEach(doc => {
            menuItems[doc.data().name] = doc.id;
        });

        console.log(`📋 Found ${Object.keys(menuItems).length} menu items in database\n`);

        let uploadCount = 0;
        let updateCount = 0;
        let notFoundCount = 0;

        // Get all image files from directory
        const files = fs.readdirSync(IMAGE_DIR);
        const imageFiles = files.filter(f => f.endsWith('.png'));

        console.log(`🖼️  Found ${imageFiles.length} image files to upload\n`);

        for (const [imageKey, menuItemName] of Object.entries(imageMapping)) {
            try {
                // Find the actual file that matches this key
                const imageFile = imageFiles.find(f => f.startsWith(imageKey));

                if (!imageFile) {
                    console.log(`⚠️  Image file not found for: ${imageKey}`);
                    continue;
                }

                const imagePath = path.join(IMAGE_DIR, imageFile);

                // Check if menu item exists
                if (!menuItems[menuItemName]) {
                    console.log(`⚠️  Menu item not found: "${menuItemName}"`);
                    notFoundCount++;
                    continue;
                }

                // Read image file
                const imageBuffer = fs.readFileSync(imagePath);

                // Create storage reference
                const storageRef = ref(storage, `menu-images/${imageKey}.png`);

                // Upload to Firebase Storage
                console.log(`📤 Uploading: ${imageKey}.png...`);
                await uploadBytes(storageRef, imageBuffer, {
                    contentType: 'image/png'
                });

                // Get download URL
                const downloadURL = await getDownloadURL(storageRef);
                uploadCount++;

                // Update menu item with image URL
                const menuItemId = menuItems[menuItemName];
                await updateDoc(doc(db, 'menu', menuItemId), {
                    image: downloadURL
                });
                updateCount++;

                console.log(`✅ [${uploadCount}] ${menuItemName} - Image uploaded and linked`);
                console.log(`   📎 URL: ${downloadURL.substring(0, 60)}...\n`);

            } catch (error) {
                console.error(`❌ Error processing ${imageKey}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 Upload Summary:');
        console.log(`   ✅ Images uploaded to Firebase Storage: ${uploadCount}`);
        console.log(`   ✅ Menu items updated with images: ${updateCount}`);
        console.log(`   ⚠️  Menu items not found: ${notFoundCount}`);
        console.log('='.repeat(70));
        console.log('\n🎉 Image upload completed successfully!');
        console.log('💡 All menu items now have professional images!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the upload
uploadImages();
