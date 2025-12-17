/**
 * Firebase Data Import Script
 * Imports data from local JSON files to NEW Firebase project
 * 
 * IMPORTANT: Update firebaseConfig below with YOUR NEW project config before running!
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ NEW FIREBASE CONFIG - India Region (Mumbai)
// From tashizom-india project
const NEW_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAF6VUY2BhcJTACuoGKl7Q7trZGMm5UYF0",
    authDomain: "charged-satellite.firebaseapp.com",
    projectId: "charged-satellite",
    storageBucket: "charged-satellite.firebasestorage.app",
    messagingSenderId: "532982159192",
    appId: "1:532982159192:web:bd82889beb87177df8f72d",
    measurementId: "G-MEASUREMENT_ID"
};

// Check if config has been updated
if (NEW_FIREBASE_CONFIG.apiKey === "YOUR_NEW_API_KEY") {
    console.error('\n❌ ERROR: You must update NEW_FIREBASE_CONFIG in this file first!');
    console.error('📝 Get your new config from Firebase Console:');
    console.error('   1. Go to: https://console.firebase.google.com');
    console.error('   2. Select your NEW project');
    console.error('   3. Go to Project Settings → Your apps');
    console.error('   4. Copy the firebaseConfig object');
    console.error('   5. Replace NEW_FIREBASE_CONFIG in import-data.mjs\n');
    process.exit(1);
}

const app = initializeApp(NEW_FIREBASE_CONFIG);
const db = getFirestore(app);

const BACKUP_DIR = path.join(__dirname, 'migration-backup');

console.log('🚀 Starting Firebase Data Import...');
console.log('📂 Reading from:', BACKUP_DIR);
console.log('🎯 Target project:', NEW_FIREBASE_CONFIG.projectId);
console.log('='.repeat(60));

/**
 * Import a collection from JSON file
 */
async function importCollection(collectionName) {
    try {
        const filePath = path.join(BACKUP_DIR, `${collectionName}.json`);

        if (!fs.existsSync(filePath)) {
            console.log(`\n⚠️  File not found: ${collectionName}.json (skipping)`);
            return 0;
        }

        console.log(`\n📤 Importing collection: ${collectionName}`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let imported = 0;
        for (const item of data) {
            try {
                const { id, ...docData } = item;
                await setDoc(doc(db, collectionName, id), docData);
                imported++;
                process.stdout.write(`\r   Progress: ${imported}/${data.length} documents`);
            } catch (error) {
                console.error(`\n   ❌ Error importing document ${item.id}:`, error.message);
            }
        }

        console.log(`\n   ✅ Imported ${imported} documents to ${collectionName}`);
        return imported;
    } catch (error) {
        console.error(`\n   ❌ Error importing ${collectionName}:`, error.message);
        return 0;
    }
}

/**
 * Import settings documents
 */
async function importSettings() {
    try {
        const filePath = path.join(BACKUP_DIR, 'settings.json');

        if (!fs.existsSync(filePath)) {
            console.log(`\n⚠️  settings.json not found (skipping)`);
            return;
        }

        console.log(`\n📤 Importing settings documents`);
        const allSettings = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        for (const [docName, docData] of Object.entries(allSettings)) {
            try {
                await setDoc(doc(db, 'settings', docName), docData);
                console.log(`   ✅ Imported settings/${docName}`);
            } catch (error) {
                console.error(`   ❌ Error importing settings/${docName}:`, error.message);
            }
        }
    } catch (error) {
        console.error(`   ❌ Error importing settings:`, error.message);
    }
}

/**
 * Import nested collection
 */
async function importNestedCollection(parentPath, collectionName) {
    try {
        const fileName = `${parentPath.replace(/\//g, '_')}_${collectionName}.json`;
        const filePath = path.join(BACKUP_DIR, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`\n⚠️  ${fileName} not found (skipping)`);
            return 0;
        }

        console.log(`\n📤 Importing nested collection: ${parentPath}/${collectionName}`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let imported = 0;
        for (const item of data) {
            try {
                const { id, ...docData } = item;
                await setDoc(doc(db, parentPath, collectionName, id), docData);
                imported++;
            } catch (error) {
                console.error(`   ❌ Error importing document:`, error.message);
            }
        }

        console.log(`   ✅ Imported ${imported} documents`);
        return imported;
    } catch (error) {
        console.error(`   ❌ Error importing ${parentPath}/${collectionName}:`, error.message);
        return 0;
    }
}

/**
 * Main import function
 */
async function importAllData() {
    const startTime = Date.now();
    let totalDocs = 0;

    // Check if backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
        console.error(`\n❌ ERROR: Backup directory not found: ${BACKUP_DIR}`);
        console.error('📝 Please run export-data.mjs first to create backup!\n');
        process.exit(1);
    }

    console.log('\n📦 Starting import of all collections...\n');
    console.log('⚠️  NOTE: User accounts (Authentication) cannot be migrated automatically.');
    console.log('   You will need to recreate them using /admin/init page.\n');

    // Import main collections
    totalDocs += await importCollection('menu');
    totalDocs += await importCollection('tables');
    totalDocs += await importCollection('orders');
    totalDocs += await importCollection('users'); // Firestore user profiles (not Auth)
    totalDocs += await importCollection('reviews');
    totalDocs += await importCollection('notifications');
    totalDocs += await importCollection('analytics_scans');

    // Import settings
    await importSettings();

    // Import nested collections (media library)
    await importNestedCollection('settings/media', 'library');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total documents imported: ${totalDocs}`);
    console.log(`⏱️  Time taken: ${duration}s`);
    console.log(`🎯 Target project: ${NEW_FIREBASE_CONFIG.projectId}`);
    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('   1. Recreate user accounts via /admin/init');
    console.log('   2. Update src/lib/firebase.ts with new config');
    console.log('   3. Update .firebaserc with new project ID');
    console.log('   4. Test locally with: npm run dev');
    console.log('   5. Deploy with: npm run build && firebase deploy');
    console.log('='.repeat(60));
}

// Run the import
importAllData()
    .then(() => {
        console.log('\n✅ Import script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Import script failed:', error);
        process.exit(1);
    });
