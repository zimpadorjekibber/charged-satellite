
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

async function createVegNoodle() {
    console.log('Creating Veg Noodle...');
    try {
        const newItem = {
            name: "Veg Noodle",
            description: "Classic stir-fried noodles with fresh vegetables and soy sauce.",
            price: 180, // Estimated price
            category: "Chinese",
            image: "/menu_items/enhanced_chowmein_v2_1765534063565.png",
            isVegetarian: true,
            available: true
        };

        const res = await addDoc(collection(db, 'menu'), newItem);
        console.log('Created Veg Noodle with ID:', res.id);
    } catch (e) {
        console.error('Failed to create Veg Noodle:', e);
    }
}

createVegNoodle();
