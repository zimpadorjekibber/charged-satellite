const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function processImage() {
    const imagePath = path.join(__dirname, 'public', 'tashi-corner.png');
    console.log(`Reading image from: ${imagePath}`);

    let jimpLib = require('jimp');
    // Handle potential default export in some setups
    if (jimpLib.default) jimpLib = jimpLib.default;
    // Check if jimpLib itself is the thing or if it has Jimp property
    if (jimpLib.Jimp) jimpLib = jimpLib.Jimp;

    try {
        const image = await jimpLib.read(imagePath);

        // Scan each pixel
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If pixel is white (or close to white), make it transparent
            // Threshold of 230
            if (red > 230 && green > 230 && blue > 230) {
                this.bitmap.data[idx + 3] = 0;
            }
        });

        // Use standard write with callback, wrapped in promise
        await new Promise((resolve, reject) => {
            image.write(imagePath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Successfully removed white background!');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

processImage();
