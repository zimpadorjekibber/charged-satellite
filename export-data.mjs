/**
 * Firebase Data Export Script
 * Exports all data from current Firebase project to local JSON files
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OLD Firebase Config (US Region)
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
const storage = getStorage(app);

const BACKUP_DIR = path.join(__dirname, 'migration-backup');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('🚀 Starting Firebase Data Export...');
console.log('📂 Backup directory:', BACKUP_DIR);
console.log('='.repeat(60));

/**
 * Export a Firestore collection to JSON
 */
async function exportCollection(collectionName) {
    try {
        console.log(`\n📥 Exporting collection: ${collectionName}`);
        const snapshot = await getDocs(collection(db, collectionName));
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const filePath = path.join(BACKUP_DIR, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`   ✅ Exported ${data.length} documents to ${collectionName}.json`);
        return data.length;
    } catch (error) {
        console.error(`   ❌ Error exporting ${collectionName}:`, error.message);
        return 0;
    }
}

/**
 * Export nested subcollection (e.g., settings/media/library)
 */
async function exportNestedCollection(parentPath, collectionName) {
    try {
        console.log(`\n📥 Exporting nested collection: ${parentPath}/${collectionName}`);
        const snapshot = await getDocs(collection(db, parentPath, collectionName));
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const filePath = path.join(BACKUP_DIR, `${parentPath.replace(/\//g, '_')}_${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`   ✅ Exported ${data.length} documents to ${filePath}`);
        return data.length;
    } catch (error) {
        console.error(`   ❌ Error exporting ${parentPath}/${collectionName}:`, error.message);
        return 0;
    }
}

/**
 * Export settings documents
 */
async function exportSettings() {
    try {
        console.log(`\n📥 Exporting settings documents`);
        const settingsDocs = ['global', 'updates', 'contact'];
        const allSettings = {};

        for (const docName of settingsDocs) {
            try {
                const snapshot = await getDocs(collection(db, 'settings'));
                const doc = snapshot.docs.find(d => d.id === docName);
                if (doc) {
                    allSettings[docName] = doc.data();
                    console.log(`   ✅ Exported settings/${docName}`);
                }
            } catch (error) {
                console.log(`   ⚠️  Could not export settings/${docName}`, error.message);
            }
        }

        const filePath = path.join(BACKUP_DIR, 'settings.json');
        fs.writeFileSync(filePath, JSON.stringify(allSettings, null, 2));
        console.log(`   ✅ Saved all settings to settings.json`);
    } catch (error) {
        console.error(`   ❌ Error exporting settings:`, error.message);
    }
}

/**
 * Export storage file URLs (we'll save URLs, not download files)
 */
async function exportStorageUrls() {
    try {
        console.log(`\n📥 Exporting storage file URLs`);
        const uploadsRef = ref(storage, 'uploads');
        const result = await listAll(uploadsRef);

        const fileUrls = [];
        for (const item of result.items) {
            try {
                const url = await getDownloadURL(item);
                fileUrls.push({
                    path: item.fullPath,
                    name: item.name,
                    url: url
                });
            } catch (error) {
                console.log(`   ⚠️  Could not get URL for ${item.name}`);
            }
        }

        const filePath = path.join(BACKUP_DIR, 'storage_urls.json');
        fs.writeFileSync(filePath, JSON.stringify(fileUrls, null, 2));
        console.log(`   ✅ Exported ${fileUrls.length} file URLs to storage_urls.json`);
    } catch (error) {
        console.error(`   ❌ Error exporting storage:`, error.message);
    }
}

/**
 * Main export function
 */
async function exportAllData() {
    const startTime = Date.now();
    let totalDocs = 0;

    console.log('\n📦 Starting export of all collections...\n');

    // Export main collections
    totalDocs += await exportCollection('menu');
    totalDocs += await exportCollection('tables');
    totalDocs += await exportCollection('orders');
    totalDocs += await exportCollection('users');
    totalDocs += await exportCollection('reviews');
    totalDocs += await exportCollection('notifications');
    totalDocs += await exportCollection('analytics_scans');

    // Export settings
    await exportSettings();

    // Export nested collections (media library)
    await exportNestedCollection('settings/media', 'library');

    // Export storage URLs
    await exportStorageUrls();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ EXPORT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total documents exported: ${totalDocs}`);
    console.log(`⏱️  Time taken: ${duration}s`);
    console.log(`📂 Backup location: ${BACKUP_DIR}`);
    console.log('\n🎯 Next Step: Run import-data.mjs to import into new project');
    console.log('='.repeat(60));
}

// Run the export
exportAllData()
    .then(() => {
        console.log('\n✅ Export script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Export script failed:', error);
        process.exit(1);
    });
