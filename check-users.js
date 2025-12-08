
process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Checking users...');
        const users = await prisma.user.findMany();
        console.log('Users in DB:', users);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
