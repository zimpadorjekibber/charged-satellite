import * as fs from 'fs';
import * as path from 'path';

const sourceImage = 'C:/Users/Asus/.gemini/antigravity/brain/8c8730e7-e8e1-4a0a-86db-4a56af28e940/honey_chili_potato_clean_1765370621456.png';
const destinationFolder = path.resolve('./public/gallery-uploads');
const destinationFile = path.join(destinationFolder, 'honey-chili-potato-refined.png');

try {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
        console.log('✓ Created directory: public/gallery-uploads');
    }

    // Copy the file
    fs.copyFileSync(sourceImage, destinationFile);
    console.log('✓ Image saved successfully!');
    console.log(`Location: ${destinationFile}`);
    console.log('\nNext steps:');
    console.log('1. Go to Admin Portal → Media Gallery tab');
    console.log('2. Find "Honey chilly potato" and delete the old image');
    console.log('3. Click "Upload Media" and select: public/gallery-uploads/honey-chili-potato-refined.png');
    console.log('4. The new refined image will replace the old one!');
} catch (error) {
    console.error('Error:', error);
    process.exit(1);
}
