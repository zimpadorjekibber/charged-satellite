// Script to fix Aloo Parantha ordering
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixAlooParanthaOrder() {
    try {
        // Get all menu items
        const menuSnapshot = await db.collection('menu').get();
        const items = [];

        menuSnapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });

        console.log('Total menu items:', items.length);

        // Find Aloo Parantha
        const alooParantha = items.find(item => item.name === 'Aloo Parantha');

        if (alooParantha) {
            console.log('\nFound Aloo Parantha:');
            console.log('  ID:', alooParantha.id);
            console.log('  Category:', alooParantha.category);
            console.log('  Current sortOrder:', alooParantha.sortOrder);

            // Get all items in the same category
            const categoryItems = items
                .filter(item => item.category === alooParantha.category)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            console.log('\nItems in', alooParantha.category, 'category:');
            categoryItems.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.name} (sortOrder: ${item.sortOrder || 'undefined'})`);
            });

            // Find desired position for Aloo Parantha (should be after other breakfast items)
            const desiredPosition = categoryItems.findIndex(item => item.id === alooParantha.id);
            console.log('\nCurrent position of Aloo Parantha:', desiredPosition + 1);

            // If Aloo Parantha is at position 0, we need to move it down
            if (desiredPosition === 0 && categoryItems.length > 1) {
                console.log('\nAloo Parantha is at first position. Moving it...');

                // Update all items in category with proper sortOrder
                const batch = db.batch();

                categoryItems.forEach((item, index) => {
                    let newSortOrder;
                    if (item.id === alooParantha.id) {
                        // Move Aloo Parantha to position 2 or 3
                        newSortOrder = 2;
                    } else if (index < 2) {
                        // Keep first two items before Aloo Parantha
                        newSortOrder = index;
                    } else {
                        // Shift others down
                        newSortOrder = index + 1;
                    }

                    const itemRef = db.collection('menu').doc(item.id);
                    batch.update(itemRef, { sortOrder: newSortOrder });
                    console.log(`  Setting ${item.name} to sortOrder: ${newSortOrder}`);
                });

                await batch.commit();
                console.log('\n✅ Successfully updated menu order!');
            } else {
                console.log('\nAloo Parantha is already in a good position.');
            }
        } else {
            console.log('❌ Aloo Parantha not found in menu!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixAlooParanthaOrder();
