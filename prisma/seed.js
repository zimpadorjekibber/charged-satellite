const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'file:./dev.db';

const prisma = new PrismaClient();

const INITIAL_MENU = [
    {
        name: 'Momo Platter',
        description: 'Assorted steamed dumplings with spicy chutney.',
        price: 350,
        category: 'Starters',
        isVegetarian: false,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        available: true
    },
    {
        name: 'Thukpa',
        description: 'Traditional Himalayan noodle soup with fresh vegetables.',
        price: 280,
        category: 'Main Course',
        isVegetarian: true,
        isSpicy: true,
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
        available: true
    },
    {
        name: 'Butter Tea',
        description: 'Salted tea with yak butter, a classic warmer.',
        price: 120,
        category: 'Beverages',
        isVegetarian: true,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
        available: true
    },
    {
        name: 'Tingmo',
        description: 'Steamed Tibetan bun, soft and fluffy.',
        price: 80,
        category: 'Starters',
        isVegetarian: true,
        image: 'https://images.unsplash.com/photo-1626804475297-411d0c17605c?w=800&q=80',
        available: true
    },
    {
        name: 'Shapta',
        description: 'Stir-fried sliced meat with chili and ginger.',
        price: 450,
        category: 'Main Course',
        isVegetarian: false,
        isSpicy: true,
        image: 'https://images.unsplash.com/photo-1606850780554-b55ea2faa7b9?w=800&q=80',
        available: true
    },
    {
        name: 'Spiti Seabuckthorn Juice',
        description: 'Local berry juice rich in vitamins.',
        price: 150,
        category: 'Beverages',
        isVegetarian: true,
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80',
        available: false
    }
];

const INITIAL_TABLES = [
    { name: 'Table 1 (Window)' },
    { name: 'Table 2 (Center)' },
    { name: 'Table 3 (Corner)' },
    { name: 'Family Booth A' },
    { name: 'Balcony 1' },
];

const MOCK_USERS = [
    { name: 'Admin', username: 'admin', password: 'password123', role: 'admin' },
    { serialNumber: 'STF-001', name: 'Tenzin', username: 'tenzin', password: 'password123', role: 'staff' },
    { serialNumber: 'STF-002', name: 'Pema', username: 'pema', password: 'password123', role: 'staff' },
    { serialNumber: 'STF-003', name: 'Dorjee', username: 'dorjee', password: 'password123', role: 'staff' },
];

async function main() {
    console.log('Seeding...');

    // Users
    for (const u of MOCK_USERS) {
        await prisma.user.upsert({
            where: { username: u.username },
            update: {},
            create: u
        });
    }

    // Menu
    for (const m of INITIAL_MENU) {
        // Simple check ideally by name or create logic
        const exists = await prisma.menuItem.findFirst({ where: { name: m.name } });
        if (!exists) {
            await prisma.menuItem.create({ data: m });
        }
    }

    // Tables
    for (const t of INITIAL_TABLES) {
        const exists = await prisma.table.findFirst({ where: { name: t.name } });
        if (!exists) {
            await prisma.table.create({ data: t });
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
