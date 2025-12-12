
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

async function check() {
    try {
        const snap = await getDocs(collection(db, 'menu'));
        let count = 0;
        const out = [];
        snap.forEach(d => {
            const data = d.data();
            if (data.image && count < 20) {
                out.push(`[${d.id}] ${data.image}`);
                count++;
            }
        });
        if (count === 0) console.log("No images found in first 20 items or at all.");
        else console.log(out.join('\n'));
        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}
check();
