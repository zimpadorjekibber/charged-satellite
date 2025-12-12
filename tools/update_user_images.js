
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection } = require('firebase/firestore');

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

// 1. Define the Map of ID -> Image Path
const updates = [
    // Biryani / Rice (Using Enhanced Biryani v1)
    { id: 'yXtq7XshXGWmmyxArgdG', image: 'enhanced_biryani_v1_1765534097177.png' }, // Veg Biryani
    { id: 'OCmz3kukNbaD4xSZkHr4', image: 'enhanced_biryani_v1_1765534097177.png' }, // Veg Pulao
    { id: 'bguhcdz8HjMrRfmnqnzn', image: 'enhanced_biryani_v1_1765534097177.png' }, // Chicken Biryani

    // Pizzas (Using Enhanced Pizza v1)
    { id: 'tjZRaV606N6VS3BOyg0G', image: 'enhanced_pizza_v1_1765534311082.png' }, // Veg Pizza
    { id: 'I6OUxciNLIoG4MRF0Ig8', image: 'enhanced_pizza_v1_1765534311082.png' }, // Margherita
    { id: 'MvZ4ZF8CjtvJhWeWQALa', image: 'enhanced_pizza_v1_1765534311082.png' }, // Capsicum Onion
    { id: '3iJrp3UhAgaYKzQQaJE3', image: 'enhanced_pizza_v1_1765534311082.png' }, // Veg Corn
    { id: '4PfPhZwpnLIZI3qrnOva', image: 'enhanced_pizza_v1_1765534311082.png' }, // Ai Funghi
    { id: 'apUA2Y5RWuKLLRKtCUzB', image: 'enhanced_pizza_v1_1765534311082.png' }, // Al Pollo
    { id: 'rD9L2joE2BvDMbf8UNwZ', image: 'enhanced_pizza_v1_1765534311082.png' }, // Chicken Pizza
];

async function updateImages() {
    console.log('Starting image updates...');
    let count = 0;
    for (const update of updates) {
        try {
            const ref = doc(db, 'menu', update.id);
            const publicPath = `/menu_items/${update.image}`;
            await updateDoc(ref, { image: publicPath });
            count++;
        } catch (e) {
            console.error(`Failed to update ${update.id}:`, e);
        }
    }
    console.log('Updated', count, 'items.');
}

updateImages();
