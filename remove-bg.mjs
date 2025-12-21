
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Jimp = require('jimp');

async function removeCheckerboard(inputPath, outputPath) {
    try {
        const image = await Jimp.read(inputPath);

        // Scan every pixel
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            const a = this.bitmap.data[idx + 3];

            // Robust check for checkerboard colors (Pure White and Light Gray)
            // Usually #FFFFFF and #CCCCCC or similar.
            // We also check for strict grayness (R==G==B) to avoid killing gold highlights (which are usually slightly yellow/warm)
            // But purely desaturated highlights might be lost. Gold usually has SOME saturation.

            const isGray = (Math.abs(r - g) < 5 && Math.abs(g - b) < 5); // Allow small noise
            const isLight = r > 150; // Only target light backgrounds

            if (isGray && isLight) {
                // Set to transparent
                this.bitmap.data[idx + 3] = 0;
            }
        });

        await image.writeAsync(outputPath);
        console.log(`Processed ${inputPath} -> ${outputPath}`);
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

async function main() {
    await removeCheckerboard('d:/Reference_Projects/charged-satellite/public/tashi-corner-gold-v2.png', 'd:/Reference_Projects/charged-satellite/public/tashi-corner-gold-transparent.png');
}

main();
