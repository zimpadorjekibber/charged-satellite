import { db, storage } from '../src/lib/firebase.js';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';

async function updateHoneyChiliPotatoImage() {
    try {
        // Read the new image file
        const imagePath = 'C:/Users/Asus/.gemini/antigravity/brain/8c8730e7-e8e1-4a0a-86db-4a56af28e940/honey_chili_potato_refined_1765370517340.png';
        const imageBuffer = readFileSync(imagePath);

        // Upload to Firebase Storage
        const storageRef = ref(storage, `gallery/honey-chili-potato-${Date.now()}.png`);
        console.log('Uploading new image to Firebase Storage...');
        const snapshot = await uploadBytes(storageRef, imageBuffer, {
            contentType: 'image/png'
        });
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`✓ Image uploaded successfully: ${downloadURL}`);

        // Find and update the Honey Chili Potato entry in gallery
        const mediaSnapshot = await getDocs(collection(db, 'settings', 'media', 'library'));

        console.log(`Found ${mediaSnapshot.size} media items`);

        for (const docSnapshot of mediaSnapshot.docs) {
            const data = docSnapshot.data();
            const title = (data.title || data.name || '').toLowerCase();

            if (title.includes('honey') && title.includes('chil')) {
                console.log(`✓ Found Honey Chili Potato: ${data.title || data.name} (ID: ${docSnapshot.id})`);
                console.log(`Updating with new image URL...`);

                await updateDoc(doc(db, 'settings', 'media', 'library', docSnapshot.id), {
                    url: downloadURL,
                    updatedAt: new Date().toISOString()
                });

                console.log(`✓ Gallery image updated successfully!`);
                process.exit(0);
            }
        }

        console.log('❌ Honey Chili Potato not found in gallery.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateHoneyChiliPotatoImage();
