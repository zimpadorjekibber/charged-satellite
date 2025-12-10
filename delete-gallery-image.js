const admin = require('firebase-admin');

// Initialize with environment variables (same as your Next.js app)
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
});

const db = admin.firestore();

async function deleteGalleryImage() {
    try {
        // Get all media items
        const mediaSnapshot = await db.collection('media').get();

        console.log(`Found ${mediaSnapshot.size} media items`);

        // Find and delete the image with "original food photo 1" in the title
        for (const doc of mediaSnapshot.docs) {
            const data = doc.data();
            console.log(`Checking: ${data.title || 'No title'}`);
            if (data.title && data.title.toLowerCase().includes('original food photo 1')) {
                console.log(`Found matching image: ${data.title} (ID: ${doc.id})`);
                console.log(`Deleting...`);
                await db.collection('media').doc(doc.id).delete();
                console.log(`✓ Deleted successfully`);
                return;
            }
        }

        console.log('No matching image found.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteGalleryImage();
