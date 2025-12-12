
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = require('c:/Users/Asus/.gemini/antigravity/playground/charged-satellite/serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function createVegNoodle() {
    const newItem = {
        name: "Veg Noodle",
        description: "Classic stir-fried noodles with fresh vegetables and soy sauce.",
        price: 180, // Estimated price
        category: "Chinese",
        image: "/menu_items/enhanced_chowmein_v2_1765534063565.png",
        isVegetarian: true,
        available: true
    };

    const res = await db.collection('menu').add(newItem);
    console.log('Created Veg Noodle with ID:', res.id);
}

createVegNoodle();
