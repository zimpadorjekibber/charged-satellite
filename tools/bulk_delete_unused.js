
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const reportPath = path.join(__dirname, '../unused_images_report.txt');

if (!fs.existsSync(reportPath)) {
    console.error('Report not found');
    process.exit(1);
}

const fileStream = fs.createReadStream(reportPath);
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

async function deleteFiles() {
    let count = 0;
    for await (const line of rl) {
        if (line.trim().startsWith('- public')) {
            // Extract path: "- public\gallery\foo.png" -> "public/gallery/foo.png"
            let relPath = line.trim().substring(2).trim();
            // Fix slashes
            relPath = relPath.replace(/\\/g, '/');

            const fullPath = path.resolve(__dirname, '..', relPath);

            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`Deleted: ${relPath}`);
                count++;
            } else {
                console.log(`Skipped (not found): ${relPath}`);
            }
        }
    }
    console.log(`\nTotal deleted: ${count}`);
}

deleteFiles();
