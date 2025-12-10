const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkGallery() {
    console.log("Reading gallery from Firestore...");
    const snapshot = await getDocs(collection(db, 'settings', 'media', 'library'));

    if (snapshot.empty) {
        console.log("No documents found in settings/media/library");
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.url.includes('tashizom') || data.url.includes('corner') || data.url.includes('reference')) {
            console.log(`Found: ${data.name}`);
            console.log(`  ID: ${doc.id}`);
            console.log(`  URL: ${data.url}`);
        }
    });
    process.exit(0);
}

checkGallery();
