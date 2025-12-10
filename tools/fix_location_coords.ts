
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

async function fixLocationCoords() {
    console.log("Applying coordinates fix for Maps Location...");

    // Using Coordinates is the most reliable way to show correct location and trigger distance calculation
    const correctLocation = "32.329112,78.0080953";

    const contactRef = doc(db, 'settings', 'contact');

    await setDoc(contactRef, {
        mapsLocation: correctLocation
    }, { merge: true });

    console.log(`Successfully updated location to coordinates: ${correctLocation}`);
    process.exit(0);
}

fixLocationCoords();
