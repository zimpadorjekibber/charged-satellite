import { db, storage } from '../src/lib/firebase.js';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';

async function replaceHoneyChiliPotatoImage() {
    try {
        // Path to the new refined image
        const imagePath = path.resolve('C:/Users/Asus/.gemini/antigravity/brain/8c8730e7-e8e1-4a0a-86db-4a56af28e940/honey_chili_potato_clean_1765370621456.png');

        console.log('Reading image file...');
        const imageBuffer = fs.readFileSync(imagePath);
        console.log(`✓ Image loaded (${imageBuffer.length} bytes)`);

        // Upload to Firebase Storage
        const timestamp = Date.now();
        const storageRef = ref(storage, `uploads/${timestamp}_honey_chili_potato.png`);

        console.log('Uploading to Firebase Storage...');
        const uploadResult = await uploadBytes(storageRef, imageBuffer, {
            contentType: 'image/png'
        });

        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log(`✓ Image uploaded successfully!`);
        console.log(`URL: ${downloadURL}`);

        // Find and update the gallery entry
        console.log('\nSearching for Honey Chili Potato in gallery...');
        const mediaSnapshot = await getDocs(collection(db, 'settings', 'media', 'library'));

        let found = false;
        for (const docSnapshot of mediaSnapshot.docs) {
            const data = docSnapshot.data();
            const title = (data.title || data.name || '').toLowerCase();

            if (title.includes('honey') && title.includes('chil')) {
                console.log(`✓ Found: ${data.title || data.name} (ID: ${docSnapshot.id})`);
                console.log('Updating gallery entry...');

                await updateDoc(doc(db, 'settings', 'media', 'library', docSnapshot.id), {
                    url: downloadURL,
                    updatedAt: new Date().toISOString()
                });

                console.log('✓ Gallery image updated successfully!');
                found = true;
                break;
            }
        }

        if (!found) {
            console.log('⚠ Image not found in gallery, but upload succeeded.');
            console.log('You may need to add it manually with this URL:', downloadURL);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

replaceHoneyChiliPotatoImage();
