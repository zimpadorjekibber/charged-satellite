
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

async function updateContact() {
    console.log("Updating contact information...");

    const contactRef = doc(db, 'settings', 'contact');

    // Merge new phone number into existing settings
    await setDoc(contactRef, {
        secondaryPhone: "+919418612295"
    }, { merge: true });

    console.log("Successfully updated contact info with secondary phone: +919418612295");
    process.exit(0);
}

updateContact();
