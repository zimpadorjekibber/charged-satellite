// DIAGNOSTIC: Check Valley Updates Data Structure
// Open browser console (F12) on http://localhost:3000 and paste this:

console.clear();
console.log('=== VALLEY UPDATES DIAGNOSTIC ===\n');

const updates = useStore.getState().valleyUpdates || [];

if (updates.length === 0) {
    console.log('❌ NO UPDATES FOUND!');
} else {
    console.log(`✅ Found ${updates.length} update(s)\n`);

    updates.forEach((update, i) => {
        console.log(`\n📋 Update ${i + 1}:`);
        console.log('├─ Title:', update.title);
        console.log('├─ Status:', update.status);
        console.log('├─ Has Media URL?', update.mediaUrl ? '✅ YES' : '❌ NO');
        console.log('├─ Media URL:', update.mediaUrl || '(not set)');
        console.log('├─ Media Type:', update.mediaType || '❌ NOT SET (This is the problem!)');

        if (update.mediaUrl && !update.mediaType) {
            console.log('└─ ⚠️  FIX NEEDED: Set Media Type to "video"');
        } else if (update.mediaUrl && update.mediaType === 'video') {
            console.log('└─ ✅ Configuration looks correct!');
        }
    });

    // Check for missing mediaType
    const missingType = updates.filter(u => u.mediaUrl && !u.mediaType);
    if (missingType.length > 0) {
        console.log('\n\n🔧 QUICK FIX: Run this to fix all updates:');
        console.log('─'.repeat(50));
        console.log(`
const fixed = useStore.getState().valleyUpdates.map(u => ({
    ...u,
    mediaType: u.mediaUrl && !u.mediaType ? 'video' : u.mediaType
}));
useStore.getState().saveValleyUpdates(fixed);
alert('✅ Fixed! Refresh page now.');
        `.trim());
        console.log('─'.repeat(50));
    }
}
