
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import { execSync } from 'child_process';

const firebaseConfig = {
    apiKey: "AIzaSyAF6VUY2BhcJTACuoGKl7Q7trZGMm5UYF0",
    authDomain: "charged-satellite.firebaseapp.com",
    projectId: "charged-satellite",
    storageBucket: "charged-satellite.firebasestorage.app",
    messagingSenderId: "532982159192",
    appId: "1:532982159192:web:bd82889beb87177df8f72d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Category Mapping (DB -> Display)
const CATEGORY_MAPPING = {
    'Hot Beverages': 'Tea & Coffee',
    'Tea & Coffee': 'Tea & Coffee',

    'Omelettes': 'Omelets & Egg Dishes',
    'Omelets & Egg Dishes': 'Omelets & Egg Dishes',

    'Indian Bread': 'Indian Tawa/Tandoori Roti',
    'Indian Breads': 'Indian Tawa/Tandoori Roti',
    'Indian Tawa/Tandoori Roti': 'Indian Tawa/Tandoori Roti',

    'Snacks': 'Snacks & Starters',
    'Snacks & Starters': 'Snacks & Starters',

    'Chinese Course': 'Chinese',
    'Chinese': 'Chinese',

    'Italian Course': 'Pizza & Pasta',
    'Pizza': 'Pizza & Pasta',
    'Pizza & Pasta': 'Pizza & Pasta',

    'Salads': 'Soups & Salads',
    'Soups': 'Soups & Salads',
    'Soups & Salads': 'Soups & Salads',

    'Vegetable & Dishes': 'Main Course (Vegetarian)',
    'Main Course (Vegetarian)': 'Main Course (Vegetarian)',

    'Non-Veg': 'Main Course (Non-Vegetarian)',
    'Main Course (Non-Vegetarian)': 'Main Course (Non-Vegetarian)',

    'Rice, Pulao, Biryani': 'Rice & Biryani',
    'Rice & Biryani': 'Rice & Biryani',

    'Toasts': 'Toasts',
    'Cereals': 'Cereals',
    'Pancakes': 'Pancakes',
    'Sandwiches': 'Sandwiches',
    'Desserts': 'Desserts',
    'Cold Beverages & Shakes': 'Cold Beverages & Shakes',
    'Breakfast': 'Breakfast'
};

const PREFERRED_ORDER = [
    'Breakfast',
    'Tea & Coffee',
    'Toasts',
    'Cereals',
    'Omelets & Egg Dishes',
    'Main Course (Vegetarian)',
    'Main Course (Non-Vegetarian)',
    'Indian Tawa/Tandoori Roti',
    'Snacks & Starters',
    'Chinese',
    'Pancakes',
    'Pizza & Pasta',
    'Rice & Biryani',
    'Sandwiches',
    'Desserts',
    'Soups & Salads',
    'Cold Beverages & Shakes'
];

async function generateMenu() {
    console.log("Fetching menu from Firestore...");
    try {
        const snapshot = await getDocs(collection(db, 'menu'));
        const menu = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Fetched ${menu.length} items.`);

        // Transform Data
        const groupedMenu = {};
        PREFERRED_ORDER.forEach(c => groupedMenu[c] = []);

        let mappedCount = 0;
        let missedCount = 0;

        menu.forEach(item => {
            const rawCat = item.category?.trim();
            let displayCat = CATEGORY_MAPPING[rawCat] || rawCat;

            // Clean Description
            if (item.description) {
                const desc = item.description.toLowerCase();
                // Remove generic "Delicious [Category] item" descriptions
                if (desc.includes('delicious') && desc.includes('item')) {
                    item.description = '';
                }
            }

            // If still not in preferred list, try fuzzy match
            if (!groupedMenu[displayCat]) {
                // Try finding a key in MAPPING that is substring of rawCat? 
                // Or see if 'displayCat' is part of a preferred category
                const fuzzy = PREFERRED_ORDER.find(p => p.includes(displayCat) || displayCat.includes(p));
                if (fuzzy) displayCat = fuzzy;
                else {
                    // Still no match? Create new group
                    if (!groupedMenu[displayCat]) groupedMenu[displayCat] = [];
                }
            }

            groupedMenu[displayCat].push(item);
        });

        // Debug counts
        console.log("Items per category:");
        for (const [cat, items] of Object.entries(groupedMenu)) {
            if (items.length > 0) console.log(`  ${cat}: ${items.length}`);
        }

        // Generate HTML
        const htmlContent = `
        <html>
        <head>
            <title>TashiZom Menu</title>
            <style>
                @page { size: A4; margin: 15mm; }
                body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; color: #000; font-size: 13px; line-height: 1.5; }
                h1 { text-align: center; font-size: 28px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
                .subtitle { text-align: center; font-size: 12px; color: #444; margin-bottom: 25px; letter-spacing: 3px; text-transform: uppercase; }
                
                .category-section { margin-bottom: 25px; break-inside: auto; }
                .category-title { 
                    font-size: 18px; font-weight: 800; border-bottom: 2px solid #000; 
                    padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; 
                    letter-spacing: 1px; page-break-after: avoid; 
                }

                table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                thead { display: table-header-group; }
                tr { break-inside: avoid; page-break-inside: avoid; }
                
                td { border-bottom: 1px solid #ddd; padding: 8px 4px; vertical-align: top; }
                th { text-align: left; border-bottom: 2px solid #666; padding: 6px 4px; font-size: 11px; text-transform: uppercase; background: #fff; font-weight: bold; }
                
                .price { font-weight: bold; text-align: right; white-space: nowrap; font-size: 14px; }
                .desc { font-size: 11px; color: #555; font-style: italic; margin-top: 2px; }
                .item-name { font-weight: bold; font-size: 14px; }
                
                .veg { color: green; font-weight: bold; font-size: 10px; border: 1px solid green; padding: 1px 3px; border-radius: 3px; }
                .non-veg { color: red; font-weight: bold; font-size: 10px; border: 1px solid red; padding: 1px 3px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>TashiZom</h1>
            <p class="subtitle">KIBBER • SPITI VALLEY</p>
            
            ${PREFERRED_ORDER.map(cat => {
            const items = groupedMenu[cat];
            if (!items || items.length === 0) return '';

            // Strict Sort Logic handling 0
            items.sort((a, b) => {
                const orderA = (a.sortOrder !== undefined && a.sortOrder !== null) ? a.sortOrder : 999;
                const orderB = (b.sortOrder !== undefined && b.sortOrder !== null) ? b.sortOrder : 999;
                return orderA - orderB;
            });

            // Categories to hide "Type" column for
            const HIDE_TYPE_FOR = [
                'Tea & Coffee',
                'Cold Beverages & Shakes',
                'Indian Tawa/Tandoori Roti',
                'Cereals',
                'Toasts' // generic match if case sensitive, but our cats are Title Case usually
            ];

            const hideType = HIDE_TYPE_FOR.includes(cat);

            return `
                <div class="category-section">
                    <div class="category-title">${cat}</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: ${hideType ? '85%' : '50%'}">Item</th>
                                ${!hideType ? '<th style="width: 15%; text-align: center;">Type</th>' : ''}
                                <th style="width: 15%; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>
                                        <div class="item-name">${item.name}</div>
                                        <div class="desc">${item.description || ''}</div>
                                    </td>
                                    ${!hideType ? `
                                    <td style="text-align: center;">
                                        <span class="${item.isVegetarian ? 'veg' : 'non-veg'}">
                                            ${item.isVegetarian ? 'VEG' : 'NON-VEG'}
                                        </span>
                                    </td>` : ''}
                                    <td class="price">₹${item.price}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
        }).join('')}

            <!-- Catch-all for others -->
            ${Object.keys(groupedMenu).filter(k => !PREFERRED_ORDER.includes(k) && groupedMenu[k].length > 0).map(cat => {
            const items = groupedMenu[cat];
            const hideType = ['Tea & Coffee', 'Cold Beverages & Shakes'].includes(cat);

            return `
                <div class="category-section">
                    <div class="category-title">${cat}</div>
                     <table>
                        <thead>
                            <tr>
                                <th style="width: ${hideType ? '85%' : '50%'}">Item</th>
                                ${!hideType ? '<th style="width: 15%; text-align: center;">Type</th>' : ''}
                                <th style="width: 15%; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${groupedMenu[cat].map(item => `
                                <tr>
                                    <td>
                                        <div class="item-name">${item.name}</div>
                                        <div class="desc">${item.description || ''}</div>
                                    </td>
                                    ${!hideType ? `
                                    <td style="text-align: center;">
                                        <span class="${item.isVegetarian ? 'veg' : 'non-veg'}">
                                            ${item.isVegetarian ? 'VEG' : 'NON-VEG'}
                                        </span>
                                    </td>` : ''}
                                    <td class="price">₹${item.price}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}).join('')}
        </body>
        </html>
        `;

        fs.writeFileSync('menu_print.html', htmlContent);
        console.log("HTML Generated.");

        // Print
        const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
        const outputPdf = "d:\\Reference_Projects\\charged-satellite\\TashiZom_Menu_Printable.pdf";
        const inputHtml = "d:\\Reference_Projects\\charged-satellite\\menu_print.html";

        if (fs.existsSync(edgePath)) {
            try {
                // Added --no-pdf-header-footer to remove date/url
                execSync(`"${edgePath}" --headless --print-to-pdf="${outputPdf}" --no-pdf-header-footer "${inputHtml}"`);
                console.log("PDF Generated.");
            } catch (e) { console.error("PDF Fail", e); }
        }

    } catch (err) {
        console.error("Error:", err);
    }
    process.exit(0);
}

generateMenu();
