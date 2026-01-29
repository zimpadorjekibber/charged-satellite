// QUICK FIX: Add sample Valley Update with YouTube video
// Open browser console (F12) on http://localhost:3000 and paste this:

const sampleUpdate = {
    title: "Road Status - Manali to Kaza",
    description: "Highway is open today. Clear weather conditions for travel.",
    status: "OPEN",
    statusColor: "green",
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/watch?v=7LJAXdqD-vE"  // Sample Spiti Valley video
};

// Add to existing updates
const currentUpdates = useStore.getState().valleyUpdates || [];
useStore.getState().saveValleyUpdates([...currentUpdates, sampleUpdate]);

console.log('✅ Sample Valley Update added!');
console.log('🔄 Refresh the home page to see it');
console.log('📍 Scroll down to "Valley Updates" section');
