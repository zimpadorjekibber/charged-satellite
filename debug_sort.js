
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

async function checkChineseSort() {
    console.log("Fetching menu...");
    const snapshot = await getDocs(collection(db, 'menu'));
    const menu = snapshot.docs.map(doc => doc.data());

    // Filter for Chinese
    const chineseItems = menu.filter(i => {
        const cat = (i.category || '').toLowerCase();
        return cat.includes('chinese');
    });

    console.log(`Found ${chineseItems.length} Chinese intems.`);

    // Sort logic from my script
    chineseItems.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

    console.log("--- Current Script Sort Order ---");
    chineseItems.forEach(i => {
        console.log(`[${i.sortOrder ?? 'ND'}] ${i.name}`);
    });
    process.exit(0);
}

checkChineseSort();
