
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

async function fixLocation() {
    console.log("Fixing Maps Location...");

    const contactRef = doc(db, 'settings', 'contact');

    // Update maps location to the correct query
    await setDoc(contactRef, {
        mapsLocation: "TashiZom+Restaurant,+Kibber"
    }, { merge: true });

    console.log("Successfully updated location to: TashiZom Restaurant Kibber");
    process.exit(0);
}

fixLocation();
