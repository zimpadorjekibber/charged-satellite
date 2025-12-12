
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = require('c:/Users/Asus/.gemini/antigravity/playground/charged-satellite/serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// 1. Define the Map of ID -> Image Path
const updates = [
    // Biryani / Rice (Using Enhanced Biryani v1)
    // Image: enhanced_biryani_v1_1765534097177.png
    // Artifact path not needed, just the uploaded path? No, I generated an enhanced one.
    // I should use the ENHANCED image path.
    // I need to know the path of the generated images.
    // The previous tool outputs gave me the paths.

    // Veg Biryani
    { id: 'yXtq7XshXGWmmyxArgdG', image: 'enhanced_biryani_v1_1765534097177.png' },
    // Veg Pulao
    { id: 'OCmz3kukNbaD4xSZkHr4', image: 'enhanced_biryani_v1_1765534097177.png' },
    // Chicken Biryani
    { id: 'bguhcdz8HjMrRfmnqnzn', image: 'enhanced_biryani_v1_1765534097177.png' },

    // Pizzas (Using Enhanced Pizza v1)
    // Image: enhanced_pizza_v1_1765534311082.png
    { id: 'tjZRaV606N6VS3BOyg0G', image: 'enhanced_pizza_v1_1765534311082.png' }, // Veg Pizza
    { id: 'I6OUxciNLIoG4MRF0Ig8', image: 'enhanced_pizza_v1_1765534311082.png' }, // Margherita
    { id: 'MvZ4ZF8CjtvJhWeWQALa', image: 'enhanced_pizza_v1_1765534311082.png' }, // Capsicum Onion
    { id: '3iJrp3UhAgaYKzQQaJE3', image: 'enhanced_pizza_v1_1765534311082.png' }, // Veg Corn
    { id: '4PfPhZwpnLIZI3qrnOva', image: 'enhanced_pizza_v1_1765534311082.png' }, // Ai Funghi
    { id: 'apUA2Y5RWuKLLRKtCUzB', image: 'enhanced_pizza_v1_1765534311082.png' }, // Al Pollo
    { id: 'rD9L2joE2BvDMbf8UNwZ', image: 'enhanced_pizza_v1_1765534311082.png' }, // Chicken Pizza

    // Create Veg Noodle if missing? 
    // This script only updates. I'll handle creation separately or manually.
];

// Note: I need to actually UPLOAD these images to storage or assume they are local and I'm setting a local path?
// The store uses 'images/...' typically for storage paths, or full URLs.
// Since I generated them, they are on the local disk. I need to upload them to Firebase Storage or put them in `public/images` and deploy.
// Given the environment, I should probably put them in `public/menu_items` and reference them as `/menu_items/...`.

// I'll assume I should move the generated images to `public/menu_items/` first.

async function updateImages() {
    const batch = db.batch();

    for (const update of updates) {
        const ref = db.collection('menu').doc(update.id);
        // Path in public folder
        const publicPath = `/menu_items/${update.image}`;
        batch.update(ref, { image: publicPath });
    }

    await batch.commit();
    console.log('Updated', updates.length, 'items.');
}

updateImages();
