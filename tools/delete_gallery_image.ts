import { db } from '../src/lib/firebase.js';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

async function deleteGalleryImage() {
    try {
        // Correct path: settings/media/library (subcollection)
        const mediaSnapshot = await getDocs(collection(db, 'settings', 'media', 'library'));

        console.log(`Found ${mediaSnapshot.size} media items`);

        for (const docSnapshot of mediaSnapshot.docs) {
            const data = docSnapshot.data();
            console.log(`Checking: ${data.title || data.name || 'No title'}`);

            const title = (data.title || data.name || '').toLowerCase();
            if (title.includes('original food photo 1')) {
                console.log(`✓ Found matching image: ${data.title || data.name} (ID: ${docSnapshot.id})`);
                console.log(`Deleting...`);
                await deleteDoc(doc(db, 'settings', 'media', 'library', docSnapshot.id));
                console.log(`✓ Deleted successfully from Firestore!`);
                process.exit(0);
            }
        }

        console.log('❌ No matching image found.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteGalleryImage();
