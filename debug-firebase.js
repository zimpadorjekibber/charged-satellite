const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setLogLevel } = require('firebase/firestore');

// Enable verbose logging to see what's happening under the hood
setLogLevel('debug');

const firebaseConfig = {
    apiKey: "AIzaSyCW1Vb_w8tAqbCNlbYR2WHZLdqLYWs-dvY",
    authDomain: "tashizom.firebaseapp.com",
    projectId: "tashizom",
    storageBucket: "tashizom.firebasestorage.app",
    messagingSenderId: "1059551779677",
    appId: "1:1059551779677:web:67e12f3c8fdd6c29071d21",
    measurementId: "G-HQHVZHMWZR"
};

console.log('🔄 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
    console.log('📡 Attempting to write a test document...');
    try {
        const testRef = await addDoc(collection(db, 'debug_tests'), {
            timestamp: new Date().toISOString(),
            status: 'connection_verified',
            message: 'Hello from debug script!'
        });
        console.log('✅ SUCCESS! Connection established.');
        console.log(`📝 Written document ID: ${testRef.id}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ FAILURE: Could not write to Firestore.');
        console.error('Error details:', error);

        if (error.code === 'unavailable') {
            console.error('\n⚠️  POSSIBLE CAUSE: Network firewall or connectivity issue.');
        } else if (error.code === 'permission-denied') {
            console.error('\n⚠️  POSSIBLE CAUSE: Firestore Security Rules are blocking writes.');
        }

        process.exit(1);
    }
}

testConnection();
