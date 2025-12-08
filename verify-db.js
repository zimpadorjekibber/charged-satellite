
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        const tableCount = await prisma.table.count();
        const userCount = await prisma.user.count();
        const menuCount = await prisma.menuItem.count();

        console.log("✅ Successfully connected to database!");
        console.log(`- Tables: ${tableCount}`);
        console.log(`- Users: ${userCount}`);
        console.log(`- Menu Items: ${menuCount}`);

        if (userCount === 0) {
            console.warn("⚠️ No users found. You may need to run seeding.");
        }
    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
