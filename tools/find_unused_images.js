
const fs = require('fs');
const path = require('path');
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

// Directories to check
const DIRS_TO_CHECK = [
    'public/gallery',
    'public/images/placeholders',
    'public/gallery-uploads'
];

async function findUnusedImages() {
    try {
        console.log('Fetching menu data...');
        const menuSnapshot = await getDocs(collection(db, 'menu'));

        // 1. Collect all used image filenames
        const usedImages = new Set();

        let count = 0;
        menuSnapshot.forEach((doc) => {
            const data = doc.data();
            if (count === 0) {
                const debugMsg = 'DEBUG: First item structure: ' + JSON.stringify(data, null, 2);
                console.log(debugMsg);
                // We can't write to file yet as we are collecting lines, but we could push to a debug buffer
            }
            count++;

            if (data.image && data.image.length > 0) {
                const filename = path.basename(data.image);
                usedImages.add(filename);
            }
        });

        console.log(`Found ${usedImages.size} unique images referenced in database.`);

        // 2. Scan local directories
        const unusedFiles = [];
        const projectRoot = path.resolve(__dirname, '..');

        for (const relativeDir of DIRS_TO_CHECK) {
            const fullPath = path.join(projectRoot, relativeDir);

            if (!fs.existsSync(fullPath)) {
                console.log(`Warning: Directory not found: ${relativeDir}`);
                continue;
            }

            const files = fs.readdirSync(fullPath);

            files.forEach(file => {
                // Skip hidden files or non-image files if needed
                if (file.startsWith('.')) return;

                // If the file is NOT in the used set
                if (!usedImages.has(file)) {
                    unusedFiles.push({
                        file: file,
                        path: path.join(relativeDir, file),
                        fullPath: path.join(fullPath, file)
                    });
                }
            });
        }

        // 3. Report
        const reportLines = [];
        reportLines.push('='.repeat(50));
        reportLines.push('🔍 UNUSED IMAGES REPORT');
        reportLines.push('='.repeat(50));

        if (unusedFiles.length === 0) {
            reportLines.push('✅ All local images are currently in use!');
        } else {
            reportLines.push(`found ${unusedFiles.length} unused images:\n`);
            unusedFiles.forEach(f => {
                reportLines.push(` - ${f.path}`);
            });

            reportLines.push('\nTo delete these files, you can manually remove them using the file explorer.');
            // We could add auto-delete, but let's be safe first
        }

        const reportContent = reportLines.join('\n');
        console.log(reportContent);
        fs.writeFileSync('unused_images_report.txt', reportContent, 'utf8');

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findUnusedImages();
