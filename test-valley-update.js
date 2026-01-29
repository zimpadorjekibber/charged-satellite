// Quick test: Add a sample valley update with video
// Run this in the browser console while on localhost:3000

const testUpdate = {
    title: "Road Status - Kaza to Kibber",
    description: "The road from Kaza to Kibber is currently clear. Good conditions for travel today.",
    status: "OPEN",
    statusColor: "green",
    mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample YouTube URL
    mediaType: "video"
};

// If you have access to the admin panel:
// 1. Go to Settings tab
// 2. Scroll to "Valley Updates Management"
// 3. Click "Add Update"
// 4. Fill in the fields:
//    - Title: Road Status - Kaza to Kibber
//    - Status: OPEN
//    - Status Color: Green
//    - Description: The road from Kaza to Kibber is currently clear...
//    - Media Type: Video (dropdown)
//    - Media URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ

console.log("Sample update structure:", testUpdate);
console.log("\nTo add this update:");
console.log("1. Navigate to http://localhost:3000/admin");
console.log("2. Go to Settings tab");
console.log("3. Scroll to 'Valley Updates Management'");
console.log("4. Click 'Add Update' and fill in the details above");
