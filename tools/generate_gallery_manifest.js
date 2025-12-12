
const fs = require('fs');
const path = require('path');

const DIRS = [
    { path: '../public/gallery', urlPrefix: '/gallery' },
    { path: '../public/gallery-uploads', urlPrefix: '/gallery-uploads' },
    { path: '../public/images/placeholders', urlPrefix: '/images/placeholders' }
];
const MANIFEST_PATH = path.join(__dirname, '../public/gallery-manifest.json');

try {
    let allImages = [];

    DIRS.forEach(dirInfo => {
        const fullDir = path.join(__dirname, dirInfo.path);

        if (fs.existsSync(fullDir)) {
            const files = fs.readdirSync(fullDir);
            const images = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
            }).map(file => ({
                name: file,
                path: `${dirInfo.urlPrefix}/${file}`,
                size: fs.statSync(path.join(fullDir, file)).size,
                source: dirInfo.urlPrefix.replace('/', '')
            }));
            allImages = allImages.concat(images);
        }
    });

    console.log(`Found ${allImages.length} images total.`);
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(allImages, null, 2));
    console.log('Manifest written to:', MANIFEST_PATH);

} catch (err) {
    console.error('Error generating manifest:', err);
    process.exit(1);
}
