
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAF6VUY2BhcJTACuoGKl7Q7trZGMm5UYF0",
    authDomain: "charged-satellite.firebaseapp.com",
    projectId: "charged-satellite",
    storageBucket: "charged-satellite.firebasestorage.app",
    messagingSenderId: "532982159192",
    appId: "1:532982159192:web:bd82889beb87177df8f72d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDescriptions() {
    console.log("Fetching menu...");
    const snapshot = await getDocs(collection(db, 'menu'));
    const menu = snapshot.docs.map(doc => doc.data());

    const suspicious = menu.filter(i => i.description && i.description.toLowerCase().includes('delicious'));

    console.log("Found " + suspicious.length + " items with 'Delicious' in description.");
    suspicious.slice(0, 10).forEach(i => {
        console.log(`[${i.name}]: ${i.description}`);
    });
    process.exit(0);
}

checkDescriptions();
