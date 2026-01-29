// Open your browser console (F12) on http://localhost:3000
// Then paste this code to check if Valley Updates exist:

console.log('=== VALLEY UPDATES DEBUG ===');
console.log('Current Valley Updates:', useStore.getState().valleyUpdates);
console.log('Total Count:', useStore.getState().valleyUpdates?.length || 0);

if (useStore.getState().valleyUpdates?.length === 0) {
    console.log('❌ NO VALLEY UPDATES FOUND!');
    console.log('📝 To add updates:');
    console.log('1. Go to http://localhost:3000/admin');
    console.log('2. Click Settings tab');
    console.log('3. Scroll to "Valley Updates Management"');
    console.log('4. Click "Add Update" button');
} else {
    console.log('✅ Valley Updates found!');
    useStore.getState().valleyUpdates.forEach((update, i) => {
        console.log(`\nUpdate ${i + 1}:`, {
            title: update.title,
            mediaType: update.mediaType,
            mediaUrl: update.mediaUrl,
            hasVideo: update.mediaType === 'video'
        });
    });
}
