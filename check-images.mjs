
import Jimp from 'jimp';

async function checkImage(path) {
    try {
        const image = await Jimp.read(path);
        const pixel = image.getPixelColor(0, 0); // Top left pixel
        const rgba = Jimp.intToRGBA(pixel);
        console.log(`Image: ${path}`);
        console.log(`Top-left pixel: R=${rgba.r}, G=${rgba.g}, B=${rgba.b}, A=${rgba.a}`);
        if (rgba.a === 0) {
            console.log('-> Has transparent background (at least at 0,0)');
        } else {
            console.log('-> Has OPAQUE background');
        }
    } catch (err) {
        console.error(`Error reading ${path}:`, err);
    }
}

async function main() {
    await checkImage('d:/Reference_Projects/charged-satellite/public/tashi-corner.png');
    await checkImage('d:/Reference_Projects/charged-satellite/public/tashi-corner-gold.png');
    await checkImage('d:/Reference_Projects/charged-satellite/public/tashi-corner-gold-v2.png');
}

main();
