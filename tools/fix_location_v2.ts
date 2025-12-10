
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

async function fixLocationPermanent() {
    console.log("Applying permanent fix for Maps Location...");

    const contactRef = doc(db, 'settings', 'contact');

    // "Tashi Zom" (two words) + "Kibber" + "Spiti" to ensure it hits the right valley
    // Google Maps is getting confused with "Tashi Jong" in Palampur because of "TashiZom" (one word) potentially

    const correctLocation = "Tashi+Zom+Guest+House,+Kibber,+Spiti";

    await setDoc(contactRef, {
        mapsLocation: correctLocation
    }, { merge: true });

    console.log(`Successfully updated location to: ${correctLocation}`);
    process.exit(0);
}

fixLocationPermanent();
