// Quick test - Add a few sample menu items
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCW1Vb_w8tAqbCNlbYR2WHZLdqLYWs-dvY",
    authDomain: "tashizom.firebaseapp.com",
    projectId: "tashizom",
    storageBucket: "tashizom.firebasestorage.app",
    messagingSenderId: "1059551779677",
    appId: "1:1059551779677:web:67e12f3c8fdd6c29071d21",
    measurementId: "G-HQHVZHMWZR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestItems() {
    try {
        const testItems = [
            {
                name: "Butter Chicken",
                description: "Succulent chicken cooked in a creamy, buttery tomato sauce with mild spices.",
                price: 460,
                category: "Non-Veg",
                isVegetarian: false,
                available: true,
                image: ""
            },
            {
                name: "Paneer Tikka Masala",
                description: "Grilled paneer tikka tossed in a spicy, tangy tomato gravy with peppers and onions.",
                price: 380,
                category: "Vegetable & Dishes",
                isVegetarian: true,
                available: true,
                image: ""
            },
            {
                name: "Chicken Biryani",
                description: "Flavorful basmati rice layered with tender chicken and aromatic spices, served with raita.",
                price: 320,
                category: "Rice, Pulao, Biryani",
                isVegetarian: false,
                available: true,
                image: ""
            }
        ];

        console.log('🧪 Adding test menu items...\n');

        for (const item of testItems) {
            await addDoc(collection(db, 'menu'), item);
            console.log(`✅ Added: ${item.name}`);
        }

        console.log('\n✨ Test items added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addTestItems();
